import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";



export const runtime = "nodejs";

// type Ctx = { params: Promise<{ id: string }> };

// export async function GET(req: Request, { params }: Ctx){
//   return await NextResponse.json({ hit: true, params: await params });
// }




const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  done: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx): Promise<Response> {
  const body: unknown = await req.json();
  const parsed = updateTaskSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const task = await prisma.task.update({
        //bracket notation для асинхронного params, т.к. он возвращает промис, а не объект
        // alternatively, we could await params before and then use dot notation
        // like this const { id } = await params; and then where: { id }
        //or if we have name of const paramId we can do where: { id: paramId }
      where: { id: (await params).id },
      data: parsed.data,
    });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
}

export async function DELETE(_: Request, { params }: Ctx): Promise<Response> {
  try {
    await prisma.task.delete({ where: { id: (await params).id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
}
