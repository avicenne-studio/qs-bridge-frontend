import type { CreateTaskInput, ITasksService, Task } from "../ports/tasks.service";

const STORAGE_KEY = "qubic.tasks";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

const readTasks = (): Task[] => {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTasks = (tasks: Task[]) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const cloneTask = (task: Task): Task => ({ ...task });

export class LocalStorageTasksService implements ITasksService {
  async list(): Promise<Task[]> {
    return readTasks().map(cloneTask);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const tasks = readTasks();
    const task: Task = {
      id: makeId(),
      title: input.title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const next = [task, ...tasks];
    writeTasks(next);
    return cloneTask(task);
  }

  async toggle(id: string): Promise<Task> {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === id);
    if (index < 0) throw new Error("Task not found");
    const updated = { ...tasks[index], completed: !tasks[index].completed };
    const next = [...tasks];
    next[index] = updated;
    writeTasks(next);
    return cloneTask(updated);
  }

  async remove(id: string): Promise<void> {
    const tasks = readTasks();
    const next = tasks.filter((task) => task.id !== id);
    if (next.length === tasks.length) throw new Error("Task not found");
    writeTasks(next);
  }

  async clearCompleted(): Promise<number> {
    const tasks = readTasks();
    const next = tasks.filter((task) => !task.completed);
    const removed = tasks.length - next.length;
    if (removed > 0) writeTasks(next);
    return removed;
  }
}
