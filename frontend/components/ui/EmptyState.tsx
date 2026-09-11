import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardBody className="flex flex-col items-start gap-4">
        <div className="rounded-lg border border-border bg-muted p-2 text-muted-foreground">
          <AlertCircle className="size-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardBody>
    </Card>
  );
}
