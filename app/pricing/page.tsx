import Link from "next/link";

const pricing = [
  {
    name: "Single Download",
    price: "$9",
    description: "One PDF download credit.",
    perk: "Perfect for one targeted application."
  },
  {
    name: "30-Day Unlimited",
    price: "$19",
    description: "Unlimited downloads for 30 days.",
    perk: "Ideal for active job seekers."
  },
  {
    name: "Lifetime",
    price: "$39",
    description: "Unlimited downloads forever.",
    perk: "Best value for long-term career growth."
  }
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
            Pricing
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900">Flexible options</h1>
          <p className="mt-3 text-slate-600">
            Pick the plan that matches your job search pace.
          </p>
          <Link href="/app" className="mt-6 inline-flex text-sm font-semibold text-brand-600">
            Go to the optimizer →
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pricing.map((tier) => (
            <div
              key={tier.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{tier.price}</p>
              <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
              <p className="mt-6 text-sm text-slate-500">{tier.perk}</p>
              <Link
                href="/app"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
