import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { selectTaskStats, useTasks } from "../tasks.store";

export default function TasksPage() {
  const {
    tasks,
    loading,
    error,
    load,
    addTask,
    toggleTask,
    removeTask,
    clearCompleted,
  } = useTasks();

  const stats = useTasks(useShallow(selectTaskStats));
  const [title, setTitle] = useState("");

  useEffect(() => {
    void load();
  }, [load]);

  const handleAdd = async () => {
    await addTask(title);
    setTitle("");
  };

  return (
    <div className="p-6 text-white space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <p className="text-sm text-white/70">
          Full-store usage drives the list, selector usage drives the stats.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          className="w-full max-w-md rounded bg-white/10 px-3 py-2 text-sm"
          placeholder="Add a task"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button
          className="rounded bg-emerald-500 px-3 py-2 text-sm font-medium"
          onClick={handleAdd}
          disabled={loading || !title.trim()}
        >
          Add
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded bg-white/5 px-3 py-2"
          >
            <button
              className={
                task.completed
                  ? "text-left text-white/50 line-through"
                  : "text-left"
              }
              onClick={() => toggleTask(task.id)}
              disabled={loading}
            >
              {task.title}
            </button>
            <button
              className="text-xs text-white/60"
              onClick={() => removeTask(task.id)}
              disabled={loading}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm text-white/70">
        <span>Total: {stats.total}</span>
        <span>Completed: {stats.completed}</span>
        <span>Remaining: {stats.remaining}</span>
      </div>

      <button
        className="rounded border border-white/20 px-3 py-2 text-sm"
        onClick={clearCompleted}
        disabled={loading || stats.completed === 0}
      >
        Clear completed
      </button>
    </div>
  );
}
