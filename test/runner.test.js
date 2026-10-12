import test from "node:test";
import assert from "node:assert/strict";
import { runScenario } from "../src/runner.js";

test("scenario runner emits deterministic results and event history", () => {
  const result = runScenario({
    members: ["alice", "bob"],
    balances: { alice: 10, bob: 0 },
    proposals: [
      { from: "alice", to: "bob", amount: 4, decision: "refuse" },
      { from: "alice", to: "bob", amount: 4 },
    ],
  });

  assert.deepEqual(result.results.map(({ status }) => status), ["refused", "committed"]);
  assert.deepEqual(result.state.balances, { alice: 6, bob: 4 });
  assert.deepEqual(result.events.map(({ type }) => type), [
    "proposal-created",
    "proposal-refused",
    "proposal-created",
    "proposal-committed",
  ]);
});

test("scenario runner rejects malformed scenario definitions", () => {
  assert.throws(() => runScenario(null), /must be an object/);
  assert.throws(() => runScenario({ members: ["alice", "bob"], balances: {} }), /proposals array/);
});
