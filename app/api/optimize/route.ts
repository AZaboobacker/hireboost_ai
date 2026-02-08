import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import { rateLimit } from "@/lib/rate-limit";
import { optimizeSchema } from "@/lib/validation";
import { extractTextFromFile } from "@/lib/text-extract";
import { prisma } from "@/lib/prisma";
import { hashText } from "@/lib/utils";
import { z } from "zod";
import crypto from "crypto";

const responseSchema = z.object({
  optimized_resume_text: z.string(),
  match_score: z.number().int().min(0).max(100),
  missing_keywords: z.array(z.string()),
  bullet_improvements: z.array(
    z.object({
      before: z.string(),
      after: z.string(),
      rationale: z.string()
    })
  )
});

const systemPrompt =
  "You are an expert ATS resume writer. Optimize the resume for the job description. Use ATS friendly keywords, measurable achievements, professional tone, no lies, strong action verbs, clean structure.";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const allowedOrigin = process.env.APP_BASE_URL;
  if (allowedOrigin && origin && !origin.startsWith(allowedOrigin)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateResult = await rateLimit(ip);
  if (!rateResult.success) {
    return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
  }

  const formData = await request.formData();
  const resumeText = String(formData.get("resumeText") || "");
  const jobText = String(formData.get("jobText") || "");
  const resumeFile = formData.get("resumeFile");

  let combinedResume = resumeText;
  if (resumeFile && resumeFile instanceof File) {
    try {
      const extracted = await extractTextFromFile(resumeFile);
      combinedResume = `${combinedResume}\n${extracted}`.trim();
    } catch (error) {
      return NextResponse.json(
        { error: "We could not read your file. Please paste your resume text instead." },
        { status: 400 }
      );
    }
  }

  const parsed = optimizeSchema.safeParse({ resumeText: combinedResume, jobText });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Resume:\n${parsed.data.resumeText}\n\nJob Description:\n${parsed.data.jobText}\n\nReturn JSON in the required schema.`
        }
      ],
      temperature: 0.3
    });

    const message = completion.choices[0]?.message?.content ?? "{}";
    const parsedResult = responseSchema.parse(JSON.parse(message));
    const result = {
      ...parsedResult,
      optimized_resume_text: parsedResult.optimized_resume_text.trim(),
      missing_keywords: parsedResult.missing_keywords.map((keyword) => keyword.trim()).filter(Boolean)
    };

    const anonId = request.headers.get("cookie")?.match(/hireboost_anon=([^;]+)/)?.[1] ??
      crypto.randomUUID();

    const generation = await prisma.generation.create({
      data: {
        email_or_anon_id: anonId,
        resume_text_hash: hashText(parsed.data.resumeText),
        job_text_hash: hashText(parsed.data.jobText),
        result_json: result
      }
    });

    const response = NextResponse.json({ result });
    response.cookies.set({
      name: "hireboost_anon",
      value: anonId,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    response.cookies.set({
      name: "hireboost_last_generation",
      value: generation.id,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error("Optimize error", error);
    return NextResponse.json({ error: "Unable to generate optimization at this time." }, { status: 500 });
  }
}
