import Link from "next/link";

const features = [
  {
    title: "ATS Optimization",
    description: "Rewrite your resume with proven ATS-friendly structure and keywords."
  },
  {
    title: "Match Score",
    description: "See a 0-100 compatibility score with missing keywords surfaced."
  },
  {
    title: "Cover Letter (coming soon)",
    description: "Instantly generate tailored cover letters from your optimized resume."
  },
  {
    title: "LinkedIn Rewrite (coming soon)",
    description: "Transform your profile into a recruiter-ready narrative."
  }
];

const pricing = [
  {
    name: "Single Download",
    price: "$9",
    description: "Perfect for a one-time tune-up.",
    perk: "1 PDF download credit"
  },
  {
    name: "30-Day Unlimited",
    price: "$19",
    description: "Optimize for multiple roles this month.",
    perk: "Unlimited downloads for 30 days"
  },
  {
    name: "Lifetime",
    price: "$39",
    description: "All the updates, forever.",
    perk: "Lifetime downloads"
  }
];

export default function HomePage() {
  return (
    <main className="bg-slate-50">
      <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          HireBoost AI
        </p>
        <h1 className="mt-6 text-4xl font-semibold text-slate-900 md:text-6xl">
          Land More Interviews in 60 Seconds
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Paste your resume and a job description. We deliver an ATS-optimized resume, a
          match score, and the exact keywords you need to close the gap.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/app"
            className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-500"
          >
            Optimize My Resume
          </Link>
          <Link
            href="#pricing"
            className="rounded-full border border-slate-300 px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-500 hover:text-brand-600"
          >
            View Pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
            Simple, transparent plans
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {pricing.map((tier) => (
            <div
              key={tier.name}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{tier.price}</p>
              <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
              <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                {tier.perk}
              </div>
              <Link
                href="/app"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© 2024 HireBoost AI. All rights reserved.</p>
          <p>
            Disclaimer: HireBoost AI provides optimization guidance and does not guarantee
            interview or hiring outcomes.
          </p>
        </div>
      </footer>
    </main>
  );
}
