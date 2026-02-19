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
    label: "Bouton",
    variant: "default",
  },
};

export const Outline: Story = {
  args: {
    label: "Bouton outline",
    variant: "outline",
  },
};

export const WithIcon: Story = {
  args: {
    label: "Avec icône",
    variant: "default",
    icon: <Plus size={16} />,
  },
};

export const Disabled: Story = {
  args: {
    label: "Désactivé",
    variant: "default",
    isDisabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: "Pleine largeur",
    variant: "default",
    isFullWidth: true,
  },
};

export const AsInternalLink: Story = {
  args: {
    label: "Lien interne",
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
