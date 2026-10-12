import test from "node:test";
import assert from "node:assert/strict";
import { ChannelScenario } from "../src/channel.js";

function scenario() {
  return new ChannelScenario({
    members: ["alice", "bob", "carol"],
    balances: { alice: 100, bob: 40, carol: 0 },
  });
}

test("committed proposal advances the state and conserves balances", () => {
  const channel = scenario();
  const result = channel.propose({ from: "alice", to: "bob", amount: 25 });

  assert.equal(result.status, "committed");
  assert.deepEqual(result.state.balances, { alice: 75, bob: 65, carol: 0 });
  assert.equal(result.state.version, 1);
  assert.equal(Object.values(result.state.balances).reduce((sum, value) => sum + value, 0), 140);
});

test("a refused proposal does not wedge the scenario or change state", () => {
  const channel = scenario();
  const before = channel.snapshot();
  const refusal = channel.propose({ from: "alice", to: "bob", amount: 25, decision: "refuse" });

  assert.equal(refusal.status, "refused");
  assert.deepEqual(refusal.state, before);

  const retry = channel.propose({ from: "alice", to: "carol", amount: 10 });
  assert.equal(retry.status, "committed");
  assert.deepEqual(retry.state.balances, { alice: 90, bob: 40, carol: 10 });
});

test("insufficient funds rejects a proposal without mutating state", () => {
  const channel = scenario();
  const before = channel.snapshot();
  const result = channel.propose({ from: "carol", to: "bob", amount: 1 });

  assert.equal(result.status, "rejected");
  assert.deepEqual(result.state, before);
});

test("invalid proposals fail before state is changed", () => {
  const channel = scenario();
  assert.throws(() => channel.propose({ from: "alice", to: "alice", amount: 1 }), /differ/);
  assert.throws(() => channel.propose({ from: "mallory", to: "bob", amount: 1 }), /Unknown/);
  assert.deepEqual(channel.snapshot().balances, { alice: 100, bob: 40, carol: 0 });
});
