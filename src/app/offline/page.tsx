"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-muted rounded-full p-6">
            <WifiOff className="text-muted-foreground h-16 w-16" />
          </div>
        </div>

        <h1 className="text-foreground mb-4 text-3xl font-bold">
          You're Offline
        </h1>

        <p className="text-muted-foreground mb-8 max-w-md text-lg">
          It looks like you've lost your internet connection. Some features may
          not be available until you're back online.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-medium transition-colors"
          >
            Try Again
          </button>

          <p className="text-muted-foreground text-sm">
            Your previously viewed pages may still be available
          </p>
        </div>
      </div>
    </div>
  );
}
