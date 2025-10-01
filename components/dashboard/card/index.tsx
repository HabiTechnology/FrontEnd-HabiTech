import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bullet } from "@/components/ui/bullet";
import { cn } from "@/lib/utils";

interface DashboardCardProps
  extends Omit<React.ComponentProps<typeof Card>, "title"> {
  title: string;
  addon?: React.ReactNode;
  intent?: "default" | "success";
  children: React.ReactNode;
}

export default function DashboardCard({
  title,
  addon,
  intent = "default",
  children,
  className,
  ...props
}: DashboardCardProps) {
  return (
    <Card className={`bg-card border-border shadow-md ${className || ""}`} {...props}>
      <CardHeader className="flex items-center justify-between bg-card border-b border-border/30 pb-3">
        <CardTitle className="flex items-center gap-2.5 text-card-foreground">
          <Bullet variant={intent} />
          {title}
        </CardTitle>
        {addon && <div>{addon}</div>}
      </CardHeader>

      <CardContent className="flex-1 relative bg-card text-card-foreground pt-3">{children}</CardContent>
    </Card>
  );
}
