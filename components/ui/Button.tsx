"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { track } from "@/lib/analytics";

type Common = { children: React.ReactNode; className?: string };

type Size = "default" | "lg";

type ButtonLinkProps = Common & {
  href: string;
  variant?: "primary" | "secondary" | "secondary-film" | "primary-film";
  size?: Size;
  onClick?: ComponentPropsWithoutRef<"a">["onClick"];
};

export function ButtonLink({ href, variant = "primary", size = "default", className = "", children, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = Common &
  ComponentPropsWithoutRef<"button"> & {
    variant?: "primary" | "secondary" | "secondary-film" | "primary-film";
    size?: Size;
  };

export function Button({ variant = "primary", size = "default", className = "", children, ...rest }: ButtonProps) {
  return (
    <button className={`btn btn--${variant} btn--${size} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function TelLink({
  number,
  className = "",
  event,
  children
}: {
  number: string;
  className?: string;
  event?: "phone_tap" | "directions_tap";
  children: React.ReactNode;
}) {
  return (
    <a href={`tel:${number.replace(/\s/g, "")}`} className={className} onClick={() => event && track(event)}>
      {children}
    </a>
  );
}
