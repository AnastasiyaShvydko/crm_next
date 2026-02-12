"use client";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  onAdd: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function TaskForm({ title, setTitle, onAdd }: Props) {
  return (
 <form onSubmit={onAdd} className="flex gap-3">
  <input
    className="flex-1 bg-white border border-neutral-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Add a new task..."
  />

  <button
    type="submit"
    className="bg-black text-white px-5 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition"
  >
    Add
  </button>
</form>

  );
}
