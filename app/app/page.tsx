"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const tabs = ["Optimized Resume", "Match Score", "Missing Keywords", "Bullet Improvements"] as const;

type OptimizationResult = {
  optimized_resume_text: string;
  match_score: number;
  missing_keywords: string[];
  bullet_improvements: Array<{ before: string; after: string; rationale: string }>;
};

const pricingOptions = [
  { id: "single", label: "$9 single download" },
  { id: "30day", label: "$19 unlimited 30 days" },
  { id: "lifetime", label: "$39 lifetime" }
];

export default function AppPage() {
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedTier, setSelectedTier] = useState("single");
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const isReady = useMemo(() => resumeText.trim().length > 0 && jobText.trim().length > 0, [resumeText, jobText]);

  const handleAnalyze = async () => {
    setError(null);
    setDownloadStatus(null);
    if (!isReady) {
      setError("Please paste both your resume and job description to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("resumeText", resumeText);
      formData.append("jobText", jobText);
      if (file) {
        formData.append("resumeFile", file);
      }

      const response = await fetch("/api/optimize", {
        method: "POST",
        body: formData
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Something went wrong. Try again.");
      }
      setResult(payload.result);
      setActiveTab("Optimized Resume");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloadStatus(null);
    const response = await fetch("/api/download");
    if (response.status === 402) {
      setShowPaywall(true);
      return;
    }
    if (!response.ok) {
      const payload = await response.json();
      setDownloadStatus(payload.error || "Unable to download right now.");
      return;
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hireboost-optimized-resume.pdf";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const startCheckout = async () => {
    setIsCreatingCheckout(true);
    setDownloadStatus(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tier: selectedTier, email })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to start checkout.");
      }
      window.location.href = payload.url;
    } catch (err) {
      setDownloadStatus(err instanceof Error ? err.message : "Unable to start checkout.");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">HireBoost AI</p>
            <h1 className="text-2xl font-semibold text-slate-900">Resume Optimizer</h1>
          </div>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-brand-600">
            Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Your Resume</h2>
            <p className="mt-2 text-sm text-slate-500">
              Paste your resume or upload a PDF/DOCX for text extraction.
            </p>
            <textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              rows={10}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800"
              placeholder="Paste your resume here..."
            />
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="text-xs text-slate-400">Privacy note: We only use your text to generate your optimized resume.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Job Description</h2>
            <p className="mt-2 text-sm text-slate-500">
              Paste the job description so we can match keywords and responsibilities.
            </p>
            <textarea
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              rows={10}
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800"
              placeholder="Paste the job description here..."
            />
            <p className="mt-4 text-xs text-slate-400">Privacy note: We do not sell or share your job description.</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Analyzing..." : "Analyze & Optimize"}
          </button>
          {result && (
            <button
              onClick={handleDownload}
              className="rounded-full border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
            >
              Download PDF
            </button>
          )}
          {downloadStatus && <span className="text-sm text-red-600">{downloadStatus}</span>}
        </div>
      </section>

      {result && (
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "Optimized Resume" && (
              <div className="mt-6">
                <textarea
                  value={result.optimized_resume_text}
                  onChange={(event) =>
                    setResult({
                      ...result,
                      optimized_resume_text: event.target.value
                    })
                  }
                  rows={16}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800"
                />
              </div>
            )}

            {activeTab === "Match Score" && (
              <div className="mt-6">
                <div className="text-5xl font-semibold text-slate-900">
                  {result.match_score}
                  <span className="text-lg text-slate-500">/100</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Higher scores indicate stronger alignment with the job description.
                </p>
              </div>
            )}

            {activeTab === "Missing Keywords" && (
              <div className="mt-6 flex flex-wrap gap-2">
                {result.missing_keywords.length === 0 ? (
                  <p className="text-sm text-slate-500">No missing keywords detected.</p>
                ) : (
                  result.missing_keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      {keyword}
                    </span>
                  ))
                )}
              </div>
            )}

            {activeTab === "Bullet Improvements" && (
              <div className="mt-6 space-y-4">
                {result.bullet_improvements.length === 0 ? (
                  <p className="text-sm text-slate-500">No bullet improvements provided.</p>
                ) : (
                  result.bullet_improvements.map((improvement, index) => (
                    <div key={`${improvement.before}-${index}`} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-xs font-semibold uppercase text-slate-400">Before</p>
                      <p className="mt-1 text-sm text-slate-600">{improvement.before}</p>
                      <p className="mt-3 text-xs font-semibold uppercase text-slate-400">After</p>
                      <p className="mt-1 text-sm text-slate-900">{improvement.after}</p>
                      <p className="mt-3 text-xs text-slate-500">{improvement.rationale}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Unlock PDF downloads</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Choose a plan to download your optimized resume instantly.
                </p>
              </div>
              <button
                onClick={() => setShowPaywall(false)}
                className="text-sm font-semibold text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {pricingOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${
                    selectedTier === option.id
                      ? "border-brand-600 bg-brand-50 text-brand-600"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  <span>{option.label}</span>
                  <input
                    type="radio"
                    name="tier"
                    className="h-4 w-4"
                    checked={selectedTier === option.id}
                    onChange={() => setSelectedTier(option.id)}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                placeholder="you@email.com"
              />
            </div>
            <button
              onClick={startCheckout}
              disabled={!email || isCreatingCheckout}
              className="mt-6 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingCheckout ? "Redirecting..." : "Continue to payment"}
            </button>
            {downloadStatus && <p className="mt-3 text-sm text-red-600">{downloadStatus}</p>}
          </div>
        </div>
      )}
    </main>
  );
}
