import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import SolanaIcon from "@/components/core/assets/solana-icon";
import QubicIcon from "@/components/core/assets/qubic-icon";
import ConnectWalletButton from "./connect-wallet-button";

const meta: Meta<typeof ConnectWalletButton> = {
  title: "Wallet/ConnectWalletButton",
  component: ConnectWalletButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    onConnect: { action: "connect" },
  },
  args: {
    onConnect: fn(),
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Solana: Story = {
  args: {
    label: "Connect Solana Wallet",
    icon: <SolanaIcon className="text-primary" />,
    onConnect: fn(),
  },
};

export const Qubic: Story = {
  args: {
    label: "Connect Qubic Wallet",
    icon: <QubicIcon className="text-primary" />,
    onConnect: fn(),
  },
};
