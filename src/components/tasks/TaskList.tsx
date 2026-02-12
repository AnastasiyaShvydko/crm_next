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
          <li key={t.id} className="border rounded p-3 flex items-start gap-3">
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
                  <span className="text-xs border rounded px-2 py-0.5 font-semibold">
                    URGENT
                  </span>
                )}

                {isImportant && (
                  <span className="text-xs border rounded px-2 py-0.5 font-semibold">
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
  <ul className="mt-2 text-sm opacity-90 space-y-1">
    {(subtasksByTaskId[t.id] ?? []).map((s, idx) => (
      <li key={`${t.id}-${idx}`} className="border rounded px-2 py-1">
        {idx + 1}. {s.title}
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
