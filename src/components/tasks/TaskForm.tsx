"use client";

type Props = {
  title: string;
  setTitle: (v: string) => void;
  onAdd: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function TaskForm({ title, setTitle, onAdd }: Props) {
  return (
    <form onSubmit={onAdd} className="flex gap-2 mt-4">
      <input
        className="border rounded px-3 py-2 flex-1"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
      />
      <button className="border rounded px-4" type="submit">
        Add
      </button>
    </form>
  );
}
