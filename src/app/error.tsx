"use client";

import ErrorPage from "@/components/error-page/error-page.component";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
  return <ErrorPage variant="500" onPrimaryAction={reset} />;
}
