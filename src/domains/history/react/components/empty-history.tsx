import Button from "@/components/core/buttons/button/button";
import { routes } from "@/constants/routes";
import { Plus } from "lucide-react";

export default function EmptyHistory() {
  return (
    <div className="flex flex-col py-20 items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-base font-medium text-primary">No order</h2>
        <p className="mt-2 text-base font-normal text-gray">
          Once an order has been placed, you can find it here.
        </p>
      </div>

      <Button
        variant="default"
        label="Bridge"
        icon={<Plus size={16} />}
        path={routes.bridge.path}
        isInternalLink
      />
    </div>
  );
}
