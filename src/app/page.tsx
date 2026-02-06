"use client";

import { useEffect, useState } from "react";
import { TaskForm } from "@/components/tasks/TaskForm";
import { TaskControls, type Filter } from "@/components/tasks/TaskControls";
import { TaskList, type Task } from "@/components/tasks/TaskList";


export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
const [filter, setFilter] = useState<Filter>("all");
const [query, setQuery] = useState<string>("");

  async function load(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", { cache: "no-store" });
      if (!res.ok) throw new Error(`GET /api/tasks failed: ${res.status}`);
      const data = (await res.json()) as Task[];
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function addTask(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setError(`POST /api/tasks failed: ${res.status} ${msg}`);
      return;
    }

    setTitle("");
    await load();
  }

  async function toggleTask(task: Task): Promise<void> {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });

    if (!res.ok) {
      setError(`PATCH /api/tasks/${task.id} failed: ${res.status}`);
      return;
    }

    await load();
  }

  async function deleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setError(`DELETE /api/tasks/${id} failed: ${res.status}`);
      return;
    }

    await load();
  }

  const normalizedQuery = query.trim().toLowerCase();

  const visibleTasks = tasks
    .filter((t) => {
      if (filter === "open") return !t.done;
      if (filter === "done") return t.done;
      return true; // all
    })
    .filter((t) => {
      if (!normalizedQuery) return true;
      return t.title.toLowerCase().includes(normalizedQuery);
    });

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold">Taskboard</h1>

   <TaskForm title={title} setTitle={setTitle} onAdd={addTask} />
  

     <TaskControls
  query={query}
  setQuery={setQuery}
  filter={filter}
  setFilter={setFilter}
/>



      {error && (
        <div className="mt-4 border rounded p-3">
          <p className="font-medium">Error</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="mt-6 opacity-70">Loading...</p>
      ) :  visibleTasks.length === 0 ? (
        <p className="mt-6 opacity-70">No matching tasks.</p>
      ) : (
        <TaskList tasks={visibleTasks} onToggle={toggleTask} onDelete={deleteTask} />

      )}
    </main>
  );
}
