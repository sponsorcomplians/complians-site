"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the dashboard with SSR disabled
const SkillsExperienceComplianceDashboard = dynamic(
  () => import("../SkillsExperienceComplianceDashboard"),
  { ssr: false }
);

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<Error | null>(null);

  // Error boundary using error state and try/catch in render
  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p>{error.message}</p>
        <pre className="mt-4 text-xs text-gray-500">{error.stack}</pre>
      </div>
    );
  }

  return (
    <ErrorCatcher onError={setError}>{children}</ErrorCatcher>
  );
}

function ErrorCatcher({ children, onError }: { children: React.ReactNode; onError: (e: Error) => void }) {
  try {
    return <>{children}</>;
  } catch (e: any) {
    onError(e);
    return null;
  }
}

export default function DashboardWrapper() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <ErrorBoundary>
      <SkillsExperienceComplianceDashboard />
    </ErrorBoundary>
  );
} 