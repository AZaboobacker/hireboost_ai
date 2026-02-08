import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession, getCookieName } from "@/lib/auth";
import { generateResumePdf } from "@/lib/pdf";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const sessionToken = cookie.match(new RegExp(`${getCookieName()}=([^;]+)`))?.[1];
  const session = verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Payment required." }, { status: 402 });
  }

  const purchase = await prisma.purchase.findFirst({
    where: { email: session.email, status: "paid" },
    orderBy: { created_at: "desc" }
  });

  if (!purchase) {
    return NextResponse.json({ error: "Payment required." }, { status: 402 });
  }

  const now = new Date();
  if (purchase.tier === "30day" && purchase.expires_at && purchase.expires_at < now) {
    return NextResponse.json({ error: "Your 30-day access has expired." }, { status: 402 });
  }
  if (purchase.tier === "single" && (purchase.remaining_credits ?? 0) <= 0) {
    return NextResponse.json({ error: "You have used your download credit." }, { status: 402 });
  }

  const lastGenerationId = cookie.match(/hireboost_last_generation=([^;]+)/)?.[1];
  const anonId = cookie.match(/hireboost_anon=([^;]+)/)?.[1];

  const generation = lastGenerationId
    ? await prisma.generation.findUnique({ where: { id: lastGenerationId } })
    : anonId
      ? await prisma.generation.findFirst({
          where: { email_or_anon_id: anonId },
          orderBy: { created_at: "desc" }
        })
      : null;

  if (!generation) {
    return NextResponse.json({ error: "No optimized resume found. Please run an analysis first." }, { status: 400 });
  }

  if (purchase.tier === "single") {
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: { remaining_credits: Math.max((purchase.remaining_credits ?? 1) - 1, 0) }
    });
  }

  const result = generation.result_json as { optimized_resume_text?: string };
  const pdf = await generateResumePdf(result.optimized_resume_text ?? "");

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=hireboost-optimized-resume.pdf"
    }
  });
}
