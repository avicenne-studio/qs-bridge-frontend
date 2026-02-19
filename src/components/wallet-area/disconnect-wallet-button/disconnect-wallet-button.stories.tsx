import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import DisconnectWalletButton from "./disconnect-wallet-button";

const meta: Meta<typeof DisconnectWalletButton> = {
  title: "Wallet/DisconnectWalletButton",
  component: DisconnectWalletButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    onDisconnect: { action: "disconnect" },
  },
  args: {
    onDisconnect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDisconnect: fn(),
  },
};
