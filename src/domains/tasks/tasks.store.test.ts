import { beforeEach, describe, expect, it } from "vitest";
import { createTasksStore, selectTaskStats } from "./tasks.store";
import { MemoryTasksService } from "./adapters/memory-tasks.service";
import type { Task } from "./ports/tasks.service";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id ?? `task_${Math.random().toString(16).slice(2)}`,
  title: overrides.title ?? "Untitled",
  completed: overrides.completed ?? false,
  createdAt: overrides.createdAt ?? new Date().toISOString(),
});

describe("tasks store", () => {
  let seed: Task[];
  let service: MemoryTasksService;
  let store: ReturnType<typeof createTasksStore>;

  beforeEach(() => {
    seed = [
      makeTask({ id: "1", title: "Write tests", completed: true }),
      makeTask({ id: "2", title: "Ship tasks", completed: false }),
      makeTask({ id: "3", title: "Review UI", completed: false }),
    ];
    service = new MemoryTasksService(seed);
    store = createTasksStore({ tasksService: service });
  });

  it("load pulls tasks from the service", async () => {
    await store.getState().load();

    expect(store.getState().tasks).toHaveLength(3);
    expect(service.listCalls).toBe(1);
  });

  it("addTask appends a new task", async () => {
    await store.getState().load();

    await store.getState().addTask("New task");

    const titles = store.getState().tasks.map((task) => task.title);
    expect(titles).toContain("New task");
    expect(service.createCalls).toBe(1);
  });

  it("toggleTask flips completion state", async () => {
    await store.getState().load();

    await store.getState().toggleTask("2");

    const toggled = store.getState().tasks.find((task) => task.id === "2");
    expect(toggled?.completed).toBe(true);
    expect(service.toggleCalls).toBe(1);
  });

  it("removeTask deletes a task", async () => {
    await store.getState().load();

    await store.getState().removeTask("1");

    const ids = store.getState().tasks.map((task) => task.id);
    expect(ids).not.toContain("1");
    expect(service.removeCalls).toBe(1);
  });

  it("clearCompleted removes completed tasks", async () => {
    await store.getState().load();

    await store.getState().clearCompleted();

    expect(store.getState().tasks).toHaveLength(2);
    expect(store.getState().tasks.every((task) => !task.completed)).toBe(true);
    expect(service.clearCompletedCalls).toBe(1);
  });

  it("selector returns aggregate stats", async () => {
    await store.getState().load();

    const stats = selectTaskStats(store.getState());

    expect(stats.total).toBe(3);
    expect(stats.completed).toBe(1);
    expect(stats.remaining).toBe(2);
  });
});
