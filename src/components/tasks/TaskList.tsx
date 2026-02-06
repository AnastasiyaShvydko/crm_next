"use client";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskList({ tasks, onToggle, onDelete }: Props) {
  return (
    <ul className="mt-6 space-y-2">
      {tasks.map((t) => (
        <li key={t.id} className="border rounded p-3 flex items-center gap-3">
          <input type="checkbox" checked={t.done} onChange={() => onToggle(t)} />
          <span className={t.done ? "line-through opacity-60 flex-1" : "flex-1"}>
            {t.title}
          </span>
          <button
            onClick={() => onDelete(t.id)}
            className="border rounded px-3 py-1"
            type="button"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
