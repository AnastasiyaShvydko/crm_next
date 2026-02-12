import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });



const requestSchema = z.object({
  // сколько задач анализировать (чтобы не слать весь мир)
  taskId: z.string().min(1),
});

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();

const reqParsed = requestSchema.safeParse(body);

if (!reqParsed.success) {
  return NextResponse.json({ error: "Invalid input" }, { status: 400 });
}

const { taskId } = reqParsed.data;



const task = await prisma.task.findUnique({
  where: { id: taskId },
  select: { id: true, title: true },
});

if (!task) {
  return NextResponse.json({ error: "Task not found" }, { status: 404 });
}

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    subtasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },

        },
        required: ["title"],
      },
    },
  },
  required: ["subtasks"],
} as const;



  const instructions = `You are a task breakdown assistant.

Use ONLY the task title text. Do NOT assume missing details or invent context.

Goal:
Generate 3–7 concrete, actionable subtasks that would help complete the task.
Each subtask must be:
- specific (starts with a verb),
- small enough to do in one sitting,
- not a duplicate of another subtask.

Rules:
- If the title is too vague, return 3 clarifying subtasks that gather requirements (e.g., "Define scope...", "List acceptance criteria...").
- Do not include dates unless explicitly mentioned in the title.
- Return ONLY valid JSON matching the provided schema (no markdown, no extra text).`.trim();


const input = JSON.stringify({ title: task.title });

 // Responses API (рекомендованный интерфейс) :contentReference[oaicite:2]{index=2}
  const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    instructions,
    input,
    text: {
      format: {
        type: "json_schema",
        name: "subtasks",
        schema: outputSchema,
        strict: true,
      },
    },
  });

  const raw = response.output_text;

  const aiParsed = z
  .object({
    subtasks: z.array(
      z.object({
        title: z.string(),
      })
    ),
  })
  .parse(JSON.parse(raw));


  // Доп. защита: оставляем только id, которые реально существуют в tasks
  //const allowed = new Set(tasks.map((t) => t.id));
 //const subtasks = aiParsed.subtasks.filter((id) => allowed.has(id));





 

  return NextResponse.json({ subtasks: aiParsed.subtasks });
}
 
