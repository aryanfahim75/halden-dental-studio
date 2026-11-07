import { z } from "zod";
import { treatments } from "@/content/treatments";
import { teethById } from "@/content/teeth";
import { hoursRow, isFutureDateTime, isUpcoming } from "@/lib/hours";

export const bookingReasons = ["pain", ...treatments.map((t) => t.slug)] as const;

export const bookingSchema = z
  .object({
    reason: z.string().trim().refine(
      (v) => v === "pain" || treatments.some((t) => t.slug === v),
      "Choose a reason for your visit."
    ),
    toothId: z
      .string()
      .trim()
      .refine((v) => v === "" || Boolean(teethById[v]), "Choose the tooth from the arch or chart, or leave it out."),
    date: z.string().trim(),
    time: z.string().trim(),
    fullName: z
      .string()
      .trim()
      .min(2, "Enter your full name.")
      .max(80, "Keep your name under 80 characters."),
    phone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[\s()\-–?!.]/g, ""))
      .refine((v) => /^\+\d{7,15}$/.test(v), {
        message: "Enter a phone number with its country code, like +44 20 7946 0958."
      }),
    email: z
      .string()
      .trim()
      .max(200)
      .refine(
        (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        "Enter an email like name@example.com, or leave this empty."
      ),
    note: z
      .string()
      .trim()
      .max(500, "Keep the note under 500 characters."),
    consent: z.boolean().refine((v) => v === true, {
      message: "Agree to the privacy note so we can contact you about this request."
    }),
    requestId: z.string().trim().max(80)
  })
  .superRefine((data, ctx) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "Choose a day to continue." });
    } else if (!isUpcoming(data.date)) {
      ctx.addIssue({
        code: "custom",
        path: ["date"],
        message: "Choose a day from the next fourteen that we are open."
      });
    } else if (!hoursRow(new Date(`${data.date}T00:00:00`).getDay())?.open) {
      ctx.addIssue({ code: "custom", path: ["date"], message: "We are closed that day. Pick one of the open days." });
    }

    if (!/^\d{2}:\d{2}$/.test(data.time)) {
      ctx.addIssue({ code: "custom", path: ["time"], message: "Choose a time to continue." });
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      const row = hoursRow(new Date(`${data.date}T00:00:00`).getDay());
      if (!row || !row.open || !row.close) {
        ctx.addIssue({ code: "custom", path: ["time"], message: "That time is outside our opening hours. Pick a button from the list." });
      } else {
        const [hh, mm] = data.time.split(":").map(Number);
        const minutes = hh * 60 + mm;
        const [ch, cm] = row.close.split(":").map(Number);
        const last = ch * 60 + cm - 30;
        if (minutes < Number(row.open.split(":")[0]) * 60 || minutes > last) {
          ctx.addIssue({
            code: "custom",
            path: ["time"],
            message: "That time is outside our opening hours. Pick a button from the list."
          });
        } else if (!isFutureDateTime(data.date, data.time)) {
          ctx.addIssue({ code: "custom", path: ["time"], message: "That time has passed. Pick a later one." });
        }
      }
    }
  });

export type BookingInput = z.infer<typeof bookingSchema>;

export const apiErrorCopy = {
  network: "Check your connection and try again; your details are still here."
};
