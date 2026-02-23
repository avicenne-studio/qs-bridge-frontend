import type { Meta, StoryObj } from "@storybook/react";
import StatusItem from "./status-item";

const meta: Meta<typeof StatusItem> = {
  title: "Layout/Sidebar/StatusItem",
  component: StatusItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: "select",
      options: ["green", "red", "orange"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Statut",
    value: "Active",
    color: "green",
  },
};

export const Green: Story = {
  args: {
    label: "Connected",
    value: "Online",
    color: "green",
  },
};

export const Red: Story = {
  args: {
    label: "Error",
    value: "Offline",
    color: "red",
  },
};

export const Orange: Story = {
  args: {
    label: "Warning",
    value: "Pending",
    color: "orange",
  },
};
