"use client";

export type Filter = "all" | "open" | "done";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  filter: Filter;
  setFilter: (v: Filter) => void;
};

export function TaskControls({
  query,
  setQuery,
  filter,
  setFilter,
}: Props) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <input
        className="border rounded px-3 py-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tasks..."
      />

      <div className="flex gap-2">
        <button
          type="button"
          className={`border rounded px-3 py-1 ${filter === "all" ? "font-semibold" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={`border rounded px-3 py-1 ${filter === "open" ? "font-semibold" : ""}`}
          onClick={() => setFilter("open")}
        >
          Open
        </button>
        <button
          type="button"
          className={`border rounded px-3 py-1 ${filter === "done" ? "font-semibold" : ""}`}
          onClick={() => setFilter("done")}
        >
          Done
        </button>
      </div>
    </div>
  );
}
