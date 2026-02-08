"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Something went wrong</h1>
          <p className="mt-4 text-sm text-slate-600">
            {error.message || "We hit an unexpected error. Please try again."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={reset}
              className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
