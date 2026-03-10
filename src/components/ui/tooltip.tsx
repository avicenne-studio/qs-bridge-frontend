import * as RadixTooltip from "@radix-ui/react-tooltip";
import type { PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  content: ReactNode;
}

export default function Tooltip({ content, children }: Props) {
  const CONTENT_CLASS =
    "max-w-[320px] break-all rounded-md bg-primary px-3 py-2 text-sm text-white shadow-md";

  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content sideOffset={4} className={CONTENT_CLASS}>
            {content}
            <RadixTooltip.Arrow className="fill-primary" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
