"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

export type HelpSupportCTAProps = {
  className?: string;
  href?: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
};

export function HelpSupportCTA({
  className,
  href = "/dashboard/support",
  title = "Precisa de ajuda adicional?",
  description = "Fale com nosso time e resolva rapidamente.",
  buttonLabel = "Abrir Central de Suporte",
}: HelpSupportCTAProps) {
  return (
    <Card className={cn("bg-accent text-accent-foreground mt-8 md:mt-10", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="w-4 h-4" /> {title}
        </CardTitle>
        <CardDescription className="text-accent-foreground/90">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          asChild
          variant="outline"
          className="bg-transparent border-accent-foreground/40 text-accent-foreground hover:bg-accent-foreground/10 focus-visible:ring-2 focus-visible:ring-accent-foreground/40"
        >
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}