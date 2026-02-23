import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

// Placeholder for the Button component tests. Will be replaced with a better implementation
describe("Button", () => {
  it("displays the content passed in children", () => {
    render(<Button>My button</Button>);
    expect(screen.getByRole("button", { name: /my button/i })).toBeInTheDocument();
  });

  it("triggers onClick when the button is clicked", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onClick when the button is disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    );

    const button = screen.getByRole("button", { name: /disabled/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies the primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-[#646cff]");
  });
});
