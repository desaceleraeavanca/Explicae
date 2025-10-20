"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="breadcrumb" className={cn("md:flex items-center gap-2 text-sm text-muted-foreground", className)}>
      {items.map((item, idx) => (
        <div key={`${item.label}-${idx}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {idx < items.length - 1 && <ChevronRight className="w-4 h-4" />}
        </div>
      ))}
    </nav>
  );
}