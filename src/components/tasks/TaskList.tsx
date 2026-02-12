"use client";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
};

type Subtask = { title: string;};

type Props = {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
urgentIds: string[];
  importantIds: string[];
  reasonsById: Record<string, string>;
  
  onSubtasks: (taskId: string) => void;
  subtasksByTaskId: Record<string, Subtask[]>;
  openSubtasks: Record<string, boolean>;
  subtasksLoading: Record<string, boolean>;
};

export function TaskList({ tasks, onToggle, onDelete, urgentIds, importantIds, reasonsById, onSubtasks, subtasksByTaskId, openSubtasks, subtasksLoading }: Props) {

  const urgent = new Set(urgentIds);
  const important = new Set(importantIds);
  

return (
    <ul className="mt-6 space-y-2">
      {tasks.map((t) => {
        const isUrgent = urgent.has(t.id);
        const isImportant = important.has(t.id);
        const reason = reasonsById[t.id];

        return (
          <li
  key={t.id}
  className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
>
            <input
              className="mt-1"
              type="checkbox"
              checked={t.done}
              onChange={() => onToggle(t)}
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={t.done ? "line-through opacity-60" : ""}>
                  {t.title}
                </span>

                {isUrgent && (
  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
    URGENT
  </span>
)}

{isImportant && (
  <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
    IMPORTANT
  </span>
)}

              </div>

              {reason && (
                <div className="mt-1 text-xs opacity-70">
                  {reason}
                </div>
              )}
            </div>

            {openSubtasks[t.id] && (
  <ul className="mt-3 space-y-1">
  {(subtasksByTaskId[t.id] ?? []).map((s, i) => (
    <li
      key={i}
      className="text-sm text-neutral-600 flex items-start gap-2"
    >
      <span className="text-neutral-400">{i + 1}.</span>
      <span>{s.title}</span>
    </li>
  ))}
</ul>
)}



            <button
              onClick={() => onDelete(t.id)}
              className="border rounded px-3 py-1"
              type="button"
            >
              Delete
            </button>


            <button
  onClick={() => onSubtasks(t.id)}
  className="border rounded px-3 py-1"
  type="button"
>
  {subtasksLoading[t.id] ? "Loading..." : "Subtasks"}
</button>

          </li>
        );
      })}

      
    </ul>
  );
}
