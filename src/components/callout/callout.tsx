import cn from "@/utils/classnames";
import { cva } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

interface Props {
  description: string;
  variant: "information";
  icon: LucideIcon;
}

export default function Callout({ description, variant, icon: Icon }: Props) {
  const calloutVariants = cva("flex w-full flex-row items-start gap-3 rounded-lg p-4", {
    variants: {
      variant: {
        information: "bg-[#F2F7FF]",
      },
    },
  });

  return (
    <div className={calloutVariants({ variant })}>
      <div className="flex items-center justify-center h-6 w-fit">
        <Icon className="shrink-0 text-primary" size={16} aria-hidden strokeWidth={1} />
      </div>

      <p className={cn("font-normal text-primary", "text-sm xl:text-base")}>{description}</p>
    </div>
  );
}
