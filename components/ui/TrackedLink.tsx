"use client";

import { track, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({
  href,
  event,
  className,
  children
}: {
  href: string;
  event: AnalyticsEvent;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => track(event, { href })}>
      {children}
    </a>
  );
}
