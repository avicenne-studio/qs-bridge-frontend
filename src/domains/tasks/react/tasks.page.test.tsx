import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksPage from "./tasks.page";
import { MemoryTasksService } from "../adapters/memory-tasks.service";
import { initTasksStore } from "../tasks.store";
import type { Task } from "../ports/tasks.service";

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: overrides.id ?? `task_${Math.random().toString(16).slice(2)}`,
  title: overrides.title ?? "Untitled",
  completed: overrides.completed ?? false,
  createdAt: overrides.createdAt ?? new Date().toISOString(),
});

describe("TasksPage", () => {
  beforeEach(() => {
    const seed = [
      makeTask({ id: "1", title: "First task", completed: false }),
      makeTask({ id: "2", title: "Done task", completed: true }),
    ];
    initTasksStore({ tasksService: new MemoryTasksService(seed) });
  });

  it("renders tasks and summary stats", async () => {
    render(<TasksPage />);

    expect(screen.getByRole("heading", { name: /tasks/i })).toBeInTheDocument();

    expect(await screen.findByText("First task")).toBeInTheDocument();
    expect(screen.getByText("Done task")).toBeInTheDocument();

    expect(screen.getByText(/total: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/completed: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining: 1/i)).toBeInTheDocument();
  });

  it("adds a task", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await screen.findByText("First task");

    const input = screen.getByPlaceholderText(/add a task/i);
    await user.type(input, "New task");
    await user.click(screen.getByRole("button", { name: /add/i }));

    expect(await screen.findByText("New task")).toBeInTheDocument();
  });

  it("toggles completion state", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    const taskButton = await screen.findByRole("button", { name: "First task" });
    await user.click(taskButton);

    await waitFor(() => {
      expect(taskButton).toHaveClass("line-through");
    });
  });

  it("removes a task", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await screen.findByText("First task");

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    await user.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText("First task")).not.toBeInTheDocument();
    });
  });
});
