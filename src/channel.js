import { createHash } from "node:crypto";

export class ChannelScenario {
  #members;
  #balances;
  #version = 0;
  #events = [];
  #nextProposal = 1;

  constructor({ members, balances }) {
    if (!Array.isArray(members) || members.length < 2) {
      throw new Error("A channel needs at least two members.");
    }
    if (new Set(members).size !== members.length) {
      throw new Error("Channel members must be unique.");
    }
    this.#members = [...members];
    this.#balances = new Map(members.map((member) => [member, balances?.[member] ?? 0]));
    this.#assertInvariant();
  }

  snapshot() {
    const balances = Object.fromEntries(this.#members.map((member) => [member, this.#balances.get(member)]));
    return {
      members: [...this.#members],
      balances,
      version: this.#version,
      stateId: stateId({ balances, version: this.#version }),
    };
  }

  events() {
    return structuredClone(this.#events);
  }

  propose({ from, to, amount, decision = "accept" }) {
    this.#assertMember(from);
    this.#assertMember(to);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("Amount must be a positive safe integer.");
    }
    if (from === to) {
      throw new Error("Sender and recipient must differ.");
    }

    const proposalId = `proposal-${this.#nextProposal++}`;
    const before = this.snapshot();
    this.#events.push({ type: "proposal-created", proposalId, from, to, amount, before });

    if (decision === "refuse") {
      this.#events.push({ type: "proposal-refused", proposalId, reason: "scenario refusal", before });
      return { proposalId, status: "refused", state: this.snapshot() };
    }
    if (decision !== "accept") {
      throw new Error(`Unsupported proposal decision: ${decision}`);
    }
    if (this.#balances.get(from) < amount) {
      this.#events.push({ type: "proposal-rejected", proposalId, reason: "insufficient funds", before });
      return { proposalId, status: "rejected", state: this.snapshot() };
    }

    this.#balances.set(from, this.#balances.get(from) - amount);
    this.#balances.set(to, this.#balances.get(to) + amount);
    this.#version += 1;
    this.#assertInvariant();
    const after = this.snapshot();
    this.#events.push({ type: "proposal-committed", proposalId, from, to, amount, after });
    return { proposalId, status: "committed", state: after };
  }

  #assertMember(member) {
    if (!this.#balances.has(member)) throw new Error(`Unknown member: ${member}`);
  }

  #assertInvariant() {
    for (const [member, balance] of this.#balances) {
      if (!Number.isSafeInteger(balance) || balance < 0) {
        throw new Error(`Invalid balance for ${member}.`);
      }
    }
  }
}

function stateId(state) {
  return createHash("sha256").update(JSON.stringify(state)).digest("hex");
}
