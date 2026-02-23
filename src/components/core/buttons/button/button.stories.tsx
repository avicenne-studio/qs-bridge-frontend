import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { MemoryRouter } from "react-router-dom";
import { Plus } from "lucide-react";
import Button from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Buttons/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline"],
    },
    action: { action: "clicked" },
  },
  args: {
    action: fn(),
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Button",
    variant: "default",
  },
};

export const Outline: Story = {
  args: {
    label: "Outline button",
    variant: "outline",
  },
};

export const WithIcon: Story = {
  args: {
    label: "With icon",
    variant: "default",
    icon: <Plus size={16} />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Disabled",
    variant: "default",
    isDisabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "Full width",
    variant: "default",
    isFullWidth: true,
  },
};

export const AsInternalLink: Story = {
  args: {
    label: "Internal link",
    variant: "default",
    path: "/activity",
    isInternalLink: true,
  },
};

export const InternalLinkWithIcon: Story = {
  args: {
    label: "Start new bridge",
    variant: "default",
    icon: <Plus size={16} />,
    path: "/bridge",
    isInternalLink: true,
    isFullWidth: true,
  },
};
