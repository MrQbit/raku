#!/usr/bin/env node
import { z } from "zod";

const argv = process.argv.slice(2);

const command = argv[0];

const PackInput = z.object({
  namespace: z.string(),
  version: z.string().default("0.1.0"),
  intents: z.array(z.object({ name: z.string(), description: z.string().optional() })).default([])
});

async function main() {
  if (!command || ["help","-h","--help"].includes(command)) {
    console.log(`raku-pack <command>

Commands:
  init        scaffold a new Pack definition
  validate    validate pack.json against @raku/contracts
`);
    return;
  }

  if (command === "init") {
    const name = argv[1] || "example.pack";
    const pack = { namespace: name, version: "0.1.0", intents: [] };
    console.log(JSON.stringify(pack, null, 2));
    return;
  }

  if (command === "validate") {
    try {
      const file = argv[1] || "pack.json";
      const json = await import(`file://${process.cwd()}/${file}`, { assert: { type: "json" } });
      PackInput.parse(json.default ?? json);
      console.log("Pack definition valid");
    } catch (err: any) {
      console.error("Validation failed", err?.message ?? err);
      process.exitCode = 1;
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
