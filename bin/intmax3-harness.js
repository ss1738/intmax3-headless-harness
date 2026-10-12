#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { runScenario } from "../src/runner.js";

const [input] = process.argv.slice(2);

if (!input) {
  console.error("Usage: node bin/intmax3-harness.js <scenario.json>");
  process.exitCode = 1;
} else {
  try {
    const source = await readFile(resolve(input), "utf8");
    console.log(JSON.stringify(runScenario(JSON.parse(source)), null, 2));
  } catch (error) {
    console.error(`Scenario failed: ${error.message}`);
    process.exitCode = 1;
  }
}
