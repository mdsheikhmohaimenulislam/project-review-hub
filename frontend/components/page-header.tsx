
"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "./ui/button";

type PageHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function PageHeader({
  title,
  description,
  action,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft size={16} />
          Back
        </Button>

        {action}
      </div>
    </div>
  );
}
