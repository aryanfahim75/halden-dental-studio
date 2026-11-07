import { NextResponse } from "next/server";
import { enquirySchema } from "@/lib/validation/enquiry";
import { createEnquiry } from "@/lib/enquiryStore";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const limit = rateLimit(`enquiry:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many messages. Please call us instead." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { fullName, phone, email, message } = parsed.data;
  const record = createEnquiry({ fullName, phone, email: email || null, message });
  return NextResponse.json({ id: record.id, status: "received" }, { status: 201 });
}
