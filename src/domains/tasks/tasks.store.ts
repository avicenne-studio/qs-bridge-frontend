import { create, useStore } from "zustand";
import type { ITasksService, Task } from "./ports/tasks.service";
import { LocalStorageTasksService } from "./adapters/local-storage-tasks.service";

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

interface TasksMethods {
  load(): Promise<void>;
  addTask(title: string): Promise<void>;
  toggleTask(id: string): Promise<void>;
  removeTask(id: string): Promise<void>;
  clearCompleted(): Promise<void>;
}

export type TasksStore = TasksState & TasksMethods;

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

const toMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unexpected error";

export const selectTasks = (state: TasksStore) => state.tasks;

export const selectTaskStats = (state: TasksStore) => {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  return {
    total,
    completed,
    remaining: total - completed,
  };
};

export function createTasksStore({
  tasksService,
}: {
  tasksService: ITasksService;
}) {
  return create<TasksStore>((set) => ({
    ...initialState,

    async load() {
      set({ loading: true, error: null });
      try {
        const tasks = await tasksService.list();
        set({ tasks });
      } catch (error) {
        set({ error: toMessage(error) });
      } finally {
        set({ loading: false });
      }
    },

    async addTask(title: string) {
      const trimmed = title.trim();
      if (!trimmed) return;

      set({ loading: true, error: null });
      try {
        const task = await tasksService.create({ title: trimmed });
        set((state) => ({ tasks: [task, ...state.tasks] }));
      } catch (error) {
        set({ error: toMessage(error) });
      } finally {
        set({ loading: false });
      }
    },

    async toggleTask(id: string) {
      set({ loading: true, error: null });
      try {
        const updated = await tasksService.toggle(id);
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === updated.id ? updated : task
          ),
        }));
      } catch (error) {
        set({ error: toMessage(error) });
      } finally {
        set({ loading: false });
      }
    },

    async removeTask(id: string) {
      set({ loading: true, error: null });
      try {
        await tasksService.remove(id);
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      } catch (error) {
        set({ error: toMessage(error) });
      } finally {
        set({ loading: false });
      }
    },

    async clearCompleted() {
      set({ loading: true, error: null });
      try {
        await tasksService.clearCompleted();
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
      } catch (error) {
        set({ error: toMessage(error) });
      } finally {
        set({ loading: false });
      }
    },
  }));
}

let store: ReturnType<typeof createTasksStore> | null = null;

// For testing React components, we want to init the store with in-memory dependencies. 
export const initTasksStore = (params: { tasksService: ITasksService }) => {
  store = createTasksStore(params);
  return store;
};

export const useTasks = <T = TasksStore>(selector?: (s: TasksStore) => T) => {
  if (!store) {
    store = createTasksStore({ tasksService: new LocalStorageTasksService() });
  }
  if (selector) {
    return useStore(store, selector);
  }
  return useStore(store) as T;
};
