import type { Meta, StoryObj } from "@storybook/react";
import { Activity } from "lucide-react";
import ComboTextStats from "./combo-text-stats";

const meta: Meta<typeof ComboTextStats> = {
  title: "Activity/ComboTextStats",
  component: ComboTextStats,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: { control: "text" },
    value: { control: "text" },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Placeholder title",
    value: "Placeholder value",
    Icon: Activity,
  },
};
