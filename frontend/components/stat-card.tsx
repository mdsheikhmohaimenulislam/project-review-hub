import type { ComponentType } from "react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: number | string;
  hint: string;
  icon: ComponentType<{ size?: number }>;
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>

        <span className="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon size={20} />
        </span>
      </CardContent>
    </Card>
  );
}