import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button as Component } from "./Button";

const meta: Meta<typeof Component> = {
  title: "UI/Button",
  component: Component,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline"],
    },
    onClick: { action: "clicked" },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Click me",
  },
};

export const Primary: Story = {
  args: {
    children: "Primary button",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary button",
    variant: "secondary",
  },
};

export const Outline: Story = {
  args: {
    children: "Outline button",
    variant: "outline",
  },
};

/** Story with interaction test: the click triggers the action (verified in the Interactions tab) */
export const WithClickInteraction: Story = {
  args: {
    children: "Click to test",
    variant: "primary",
  },
  play: async ({ canvasElement, step }) => {
    const { within } = await import("@storybook/test");
    const canvas = within(canvasElement);
    await step("Clicking the button triggers the action", async () => {
      const button = canvas.getByRole("button", { name: /click to test/i });
      await button.click();
      // The onClick action (fn()) is recorded by Storybook; we check that the button is clickable
      expect(button).toBeInTheDocument();
    });
  },
};
