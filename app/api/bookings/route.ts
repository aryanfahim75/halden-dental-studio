import { NextResponse } from "next/server";
import { bookingSchema } from "@/lib/validation/booking";
import { createBooking } from "@/lib/bookingStore";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit(`bookings:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many booking requests from your connection right now. Please call the studio." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Send a JSON booking request." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ errors }, { status: 422 });
  }

  const data = parsed.data;
  const record = createBooking({
    requestId: data.requestId || undefined,
    reason: data.reason,
    toothId: data.toothId || null,
    date: data.date,
    time: data.time,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email || null,
    note: data.note || null
  });

  return NextResponse.json({ id: record.id, status: record.status }, { status: 201 });
}
