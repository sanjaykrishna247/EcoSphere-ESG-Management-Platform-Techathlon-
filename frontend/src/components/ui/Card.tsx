import type { HTMLAttributes } from "react";
import { clsx } from "@/utils/clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: "green" | "teal" | "blue" | "purple" | "amber" | "red";
  interactive?: boolean;
}

const accentClasses: Record<NonNullable<CardProps["accent"]>, string> = {
  green: "border-l-eco-green",
  teal: "border-l-earth-teal",
  blue: "border-l-sky-blue",
  purple: "border-l-governance-purple",
  amber: "border-l-amber-warning",
  red: "border-l-critical-red",
};

export function Card({ accent, interactive, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-5 transition-shadow duration-200",
        accent && `border-l-[3px] ${accentClasses[accent]}`,
        interactive && "hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
