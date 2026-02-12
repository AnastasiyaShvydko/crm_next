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


const [urgentIds, setUrgentIds] = useState<string[]>([]);
const [importantIds, setImportantIds] = useState<string[]>([]);
const [reasonsById, setReasonsById] = useState<Record<string, string>>({});
const [aiLoading, setAiLoading] = useState(false);
  
const [filter, setFilter] = useState<Filter>("all");
const [query, setQuery] = useState<string>("");

type Subtask = { title: string;};

const [subtasksByTaskId, setSubtasksByTaskId] = useState<Record<string, Subtask[]>>({});
const [openSubtasks, setOpenSubtasks] = useState<Record<string, boolean>>({});
const [subtasksLoading, setSubtasksLoading] = useState<Record<string, boolean>>({});

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


    async function aiPrioritize(): Promise<void> {
  setAiLoading(true);
  setError(null);
  try {
    const res = await fetch("/api/ai/priorities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 30 }),
    });
    if (!res.ok) throw new Error(`AI priorities failed: ${res.status}`);
    const data = await res.json();
    setUrgentIds(Array.isArray(data.urgentIds) ? data.urgentIds : []);
    setImportantIds(Array.isArray(data.importantIds) ? data.importantIds : []);
    setReasonsById(data.reasonsById ?? {});
  } catch (e) {
    setError(e instanceof Error ? e.message : "AI priorities error");
  } finally {
    setAiLoading(false);
  }
}

async function loadSubtasks(taskId: string): Promise<void> {
  // toggle open
  setOpenSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
console.log("subtasks response", taskId);
  // если уже загружено — просто показываем/скрываем
  if (subtasksByTaskId[taskId]) return;
   
  setSubtasksLoading((p) => ({ ...p, [taskId]: true }));
  try {
    const res = await fetch("/api/ai/subtasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    });
    if (!res.ok) throw new Error(`Subtasks failed: ${res.status}`);

    const data = await res.json();
    const subtasks = Array.isArray(data?.subtasks) ? data.subtasks : [];
  console.log("subtasks response", taskId, data);
    setSubtasksByTaskId((prev) => ({ ...prev, [taskId]: subtasks
      
     }) );
  } catch (e) {
    setError(e instanceof Error ? e.message : "Subtasks error");
  } finally {
    setSubtasksLoading((p) => ({ ...p, [taskId]: false }));
  }
}



  return (
    <main className="min-h-screen bg-neutral-50">
  <div className="max-w-2xl mx-auto px-6 py-12">
  <div className="flex items-center justify-between mb-8">
  <div>
    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
      Taskboard
    </h1>
    <p className="text-sm text-neutral-500 mt-1">
      AI-powered task management
    </p>
  </div>

  <button
    onClick={() => void aiPrioritize()}
    disabled={aiLoading}
    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
  >
    {aiLoading ? "Analyzing..." : "AI Prioritize"}
  </button>
</div>
</div>


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
  <p className="mt-6 text-neutral-500">Loading...</p>
) : visibleTasks.length === 0 ? (
  <div className="mt-12 text-center text-neutral-500">
    <p className="text-sm">No tasks yet.</p>
    <p className="text-xs mt-1">
      Add your first task above to get started.
    </p>
  </div>
) : (
        <TaskList
  tasks={visibleTasks}
  onToggle={toggleTask}
  onDelete={deleteTask}
  urgentIds={urgentIds}
  importantIds={importantIds}
  reasonsById={reasonsById}
  onSubtasks={loadSubtasks}
  subtasksByTaskId={subtasksByTaskId}
  openSubtasks={openSubtasks}
  subtasksLoading={subtasksLoading}
/>


      )}
    </main>
  );
}
