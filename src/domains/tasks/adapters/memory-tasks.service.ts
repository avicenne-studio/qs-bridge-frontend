import type { CreateTaskInput, ITasksService, Task } from "../ports/tasks.service";

const cloneTask = (task: Task): Task => ({ ...task });

export class MemoryTasksService implements ITasksService {
  private tasks: Task[];
  listCalls = 0;
  createCalls = 0;
  toggleCalls = 0;
  removeCalls = 0;
  clearCompletedCalls = 0;

  constructor(seed: Task[] = []) {
    this.tasks = seed.map(cloneTask);
  }

  async list(): Promise<Task[]> {
    this.listCalls++;
    return this.tasks.map(cloneTask);
  }

  async create(input: CreateTaskInput): Promise<Task> {
    this.createCalls++;
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      title: input.title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    this.tasks = [task, ...this.tasks];
    return cloneTask(task);
  }

  async toggle(id: string): Promise<Task> {
    this.toggleCalls++;
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index < 0) {
      throw new Error("Task not found");
    }
    const updated: Task = {
      ...this.tasks[index],
      completed: !this.tasks[index].completed,
    };
    this.tasks = [
      ...this.tasks.slice(0, index),
      updated,
      ...this.tasks.slice(index + 1),
    ];
    return cloneTask(updated);
  }

  async remove(id: string): Promise<void> {
    this.removeCalls++;
    const next = this.tasks.filter((task) => task.id !== id);
    if (next.length === this.tasks.length) {
      throw new Error("Task not found");
    }
    this.tasks = next;
  }

  async clearCompleted(): Promise<number> {
    this.clearCompletedCalls++;
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((task) => !task.completed);
    return before - this.tasks.length;
  }
}
