# INTMAX3 Headless Harness

An experimental, deterministic channel-scenario harness for exploring integration-test ergonomics around INTMAX3.

## Status

This is an independent proof of concept. It is **not** an INTMAX implementation, wallet, relay, proof system, cryptographic verifier, or production payment service. It does not create valid INTMAX3 transactions, signatures, proofs, or L1 settlements.

The purpose of this repository is to validate one focused developer-experience question: can an application test refusal, retry, and state-transition paths quickly without invoking native proving code? Any future adapter must be designed against a stable public INTMAX3 interface with maintainer agreement.

## What works today

- Deterministic member and balance state.
- Accepted, refused, and insufficient-funds proposal paths.
- Event history for test assertions.
- A regression scenario: a refused proposal must not prevent a later valid proposal.
- A JSON scenario format and command-line runner for repeatable local or CI checks.

## Run

Requires Node.js 20 or later.

```bash
npm test
npm run demo
npm run scenario
```

`npm run scenario` runs [examples/refused-proposal.json](examples/refused-proposal.json) and writes a JSON result containing proposal outcomes, the final state, and an event log.

## Scenario format

```json
{
  "members": ["alice", "bob"],
  "balances": { "alice": 10, "bob": 0 },
  "proposals": [
    { "from": "alice", "to": "bob", "amount": 4, "decision": "refuse" },
    { "from": "alice", "to": "bob", "amount": 4 }
  ]
}
```

Accepted proposals advance the local state. A refusal or insufficient funds leaves it unchanged, so callers can assert that a failed proposal does not prevent a later valid one.

## Scope boundaries

This project intentionally does not reproduce or stub INTMAX3 cryptography. In particular, it does not claim compatibility with the current relay wire format, wallet APIs, L1 contracts, proofs, or channel-exit rules. Those are protocol-sensitive areas that require a published compatibility target and maintainer review.

## Proposed next validation

Before expanding this proof of concept, obtain maintainer confirmation that an external headless test harness is useful and identify the stable public interface or fixture format it should target. If the existing INTMAX3 test suite already covers this need, this project should be stopped or contributed upstream instead.

## Development

The repository uses only Node's standard library and Node's built-in test runner. GitHub Actions runs the test suite and the example scenario on Node 20.

## License

MIT. See [LICENSE](LICENSE).
