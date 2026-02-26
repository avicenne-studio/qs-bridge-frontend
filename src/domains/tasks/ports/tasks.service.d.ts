export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
}

export interface ITasksService {
  list(): Promise<Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  toggle(id: string): Promise<Task>;
  remove(id: string): Promise<void>;
  clearCompleted(): Promise<number>;
}
