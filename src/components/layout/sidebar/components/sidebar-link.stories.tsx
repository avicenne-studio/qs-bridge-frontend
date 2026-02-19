import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { Home, Radio, History, SendToBack } from "lucide-react";
import SidebarLink from "./sidebar-link";

const meta: Meta<typeof SidebarLink> = {
  title: "Layout/Sidebar/SidebarLink",
  component: SidebarLink,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    path: { control: "text" },
    name: { control: "text" },
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <div className="w-[280px] rounded-lg bg-primary p-3">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    path: "/",
    name: "Home",
    Icon: Home,
  },
};

export const Activity: Story = {
  args: {
    path: "/activity",
    name: "Activity",
    Icon: Radio,
  },
};

export const Bridge: Story = {
  args: {
    path: "/bridge",
    name: "Bridge",
    Icon: SendToBack,
  },
};

export const HistoryLink: Story = {
  args: {
    path: "/history",
    name: "History",
    Icon: History,
  },
};
