import Fastify from "fastify";
import { z } from "zod";

const app = Fastify({ logger: true });

const capabilities = [
  {
    intent: "sample.echo",
    verbs: ["action"],
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    outputSchema: { type: "object", properties: { echoed: { type: "string" } } }
  },
  {
    intent: "sample.math.add",
    verbs: ["action"],
    inputSchema: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } }, required: ["a","b"] },
    outputSchema: { type: "object", properties: { sum: { type: "number" } } }
  }
];

app.get("/health", async () => ({ ok: true }));
app.post("/meta", async () => ({ name: "sample-mcp", capabilities }));
app.post("/execute", async (req, reply) => {
  const body = z.object({ intent: z.string(), inputs: z.record(z.any()) }).parse(req.body);
  if (body.intent === "sample.echo") return reply.send({ echoed: String(body.inputs?.text ?? "") });
  if (body.intent === "sample.math.add") return reply.send({ sum: Number(body.inputs?.a ?? 0) + Number(body.inputs?.b ?? 0) });
  return reply.code(404).send({ error: "intent_not_found" });
});

app.listen({ port: 9091, host: "0.0.0.0" });
