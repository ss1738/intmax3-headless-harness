import { ChannelScenario } from "./channel.js";

export function runScenario(definition) {
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    throw new Error("Scenario definition must be an object.");
  }
  if (!Array.isArray(definition.proposals)) {
    throw new Error("Scenario definition must contain a proposals array.");
  }

  const channel = new ChannelScenario({
    members: definition.members,
    balances: definition.balances,
  });
  const results = definition.proposals.map((proposal) => channel.propose(proposal));
  return { events: channel.events(), results, state: channel.snapshot() };
}
