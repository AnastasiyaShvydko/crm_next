import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const requestSchema = z.object({
  // сколько задач анализировать (чтобы не слать весь мир)
  limit: z.number().int().min(1).max(50).default(30),
});

export async function POST(req: Request): Promise<Response> {
  const body = await req.json().catch(() => ({}));
  const reqParsed = requestSchema.safeParse(body);
const limit = reqParsed.success ? reqParsed.data.limit : 30;


  // Берём только нужное: id + title + done
  const tasks = await prisma.task.findMany({
    where: { done: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, title: true },
  });

  // Если нечего анализировать
  if (tasks.length === 0) {
    return NextResponse.json({
      urgentIds: [],
      importantIds: [],
      reasonsById: {},
    });
  }

  // Строгая схема ответа от модели
const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    urgentIds: { type: "array", items: { type: "string" } },
    importantIds: { type: "array", items: { type: "string" } },
    reasons: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          reason: { type: "string" },
        },
        required: ["id", "reason"],
      },
    },
  },
  required: ["urgentIds", "importantIds", "reasons"],
} as const;



  const instructions = `
You are a task triage assistant.
Classify using ONLY the task title text. Do NOT assume missing details.
Urgent = time-sensitive, deadlines, today/tomorrow, payment, meeting, outage, blocked delivery.
Important = high impact, money/legal/health, key deliverable, long-term value.
If unsure, do not include the task.
Return STRICT JSON with:
urgentIds: string[]
importantIds: string[]
reasons: { id: string, reason: string }[]  (5-10 words)
`.trim();

const input = JSON.stringify({ tasks });

console.log(
  "schema properties:",
  Object.keys(outputSchema.properties),
  "required:",
  outputSchema.required
);

  // Responses API (рекомендованный интерфейс) :contentReference[oaicite:2]{index=2}
  const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: "priorities",
        schema: outputSchema,
        strict: true,
      },
    },
  });

  // output_text — готовая строка JSON :contentReference[oaicite:3]{index=3}
  const raw = response.output_text;

  // Валидируем на сервере ещё раз (защита)
const aiParsed = z
  .object({
    urgentIds: z.array(z.string()),
    importantIds: z.array(z.string()),
    reasons: z.array(
      z.object({
        id: z.string(),
        reason: z.string(),
      })
    ),
  })
  .parse(JSON.parse(raw));


  // Доп. защита: оставляем только id, которые реально существуют в tasks
  const allowed = new Set(tasks.map((t) => t.id));
 const urgentIds = aiParsed.urgentIds.filter((id) => allowed.has(id));
const importantIds = aiParsed.importantIds.filter((id) => allowed.has(id));

const reasonsById: Record<string, string> = {};
for (const r of aiParsed.reasons) {
  if (allowed.has(r.id)) reasonsById[r.id] = r.reason;
}

 

  return NextResponse.json({ urgentIds, importantIds, reasonsById });
}
