import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { profile } from "@/content/profile";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(5000),
});

// Tiny in-memory rate limit: fine for a personal site on a single instance.
const hits = new Map<string, { count: number; reset: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — please try again later." },
      { status: 429 }
    );
  }

  let parsed;
  try {
    parsed = contactSchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please fill in all fields correctly." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The contact form isn't configured yet." },
      { status: 503 }
    );
  }

  const { name, email, message } = parsed.data;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      // Resend's shared onboarding sender works without domain setup;
      // switch to your own verified domain later for nicer branding.
      from: "Website Contact <onboarding@resend.dev>",
      to: profile.email,
      replyTo: email,
      subject: `New message from ${name} — jereme website`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) throw new Error(error.message);
  } catch {
    return NextResponse.json(
      { error: "Couldn't send your message right now." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
