"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage({
  searchParams
}: {
  searchParams: { session_id?: string };
}) {
  const [status, setStatus] = useState("Verifying your payment...");

  useEffect(() => {
    const sessionId = searchParams.session_id;
    if (!sessionId) {
      setStatus("Missing Stripe session. Please reach out to support.");
      return;
    }
    const verify = async () => {
      const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
      const payload = await response.json();
      if (!response.ok) {
        setStatus(payload.error || "Unable to verify payment.");
        return;
      }
      setStatus("Payment confirmed. You can now download your PDF.");
    };
    verify();
  }, [searchParams.session_id]);

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Success</h1>
        <p className="mt-4 text-sm text-slate-600">{status}</p>
        <Link
          href="/app"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30"
        >
          Return to optimizer
        </Link>
      </div>
    </main>
  );
}
