import { ChannelScenario } from "../src/channel.js";

const channel = new ChannelScenario({
  members: ["alice", "bob"],
  balances: { alice: 100, bob: 0 },
});

console.log(channel.propose({ from: "alice", to: "bob", amount: 25, decision: "refuse" }));
console.log(channel.propose({ from: "alice", to: "bob", amount: 25 }));
