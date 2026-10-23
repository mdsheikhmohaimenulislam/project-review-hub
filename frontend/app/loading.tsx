import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-[50vh] place-items-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <LoaderCircle
            className="animate-spin text-primary"
            size={42}
            strokeWidth={2.5}
          />
        </div>

        <h2 className="animate-pulse text-lg font-semibold">
          Project Review Hub
        </h2>

        <p className="text-sm text-muted-foreground">
          Loading your workspace
          <span className="inline-flex w-6 text-left">
            <span className="animate-bounce">...</span>
          </span>
        </p>

        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-primary/15">
          <div className="h-full w-1/2 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-primary" />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </main>
  );
}
