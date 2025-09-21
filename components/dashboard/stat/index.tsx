import React from "react";
import NumberFlow from "@number-flow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { cn } from "@/lib/utils";
import FloatingElement from "@/components/animations/floating-element";

interface DashboardStatProps {
  label: string;
  value: string;
  description?: string;
  tag?: string;
  icon: React.ElementType;
  intent?: "positive" | "negative" | "neutral";
  direction?: "up" | "down";
}

export default function DashboardStat({
  label,
  value,
  description,
  icon,
  tag,
  intent,
  direction,
}: DashboardStatProps) {
  const Icon = icon;

  // Extract prefix, numeric value, and suffix from the value string
  const parseValue = (val: string) => {
    // Match pattern: optional prefix + number + optional suffix
    const match = val.match(/^([^\d.-]*)([+-]?\d*\.?\d+)([^\d]*)$/);

    if (match) {
      const [, prefix, numStr, suffix] = match;
      return {
        prefix: prefix || "",
        numericValue: parseFloat(numStr),
        suffix: suffix || "",
        isNumeric: !isNaN(parseFloat(numStr)),
      };
    }

    return {
      prefix: "",
      numericValue: 0,
      suffix: val,
      isNumeric: false,
    };
  };

  const getIntentClassName = () => {
    if (intent === "positive") return "text-success";
    if (intent === "negative") return "text-destructive";
    return "text-muted-foreground";
  };

  const { prefix, numericValue, suffix, isNumeric } = parseValue(value);

  return (
    <Card className="stat-card-habitech relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
      {/* Floating background element */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <FloatingElement intensity={3} duration={2000}>
          <div className="absolute top-2 right-2 w-8 h-8 bg-primary/10 rounded-full" />
        </FloatingElement>
      </div>
      
      <CardHeader className="flex items-center justify-between relative z-10">
        <CardTitle className="flex items-center gap-2.5 group-hover:text-primary transition-colors duration-300">
          <Bullet />
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
      </CardHeader>

      <CardContent className="bg-accent/50 backdrop-filter backdrop-blur-sm flex-1 pt-2 md:pt-6 overflow-clip relative border-t border-border/50 z-10">
        <div className="flex items-center">
          <span className="text-4xl md:text-5xl font-display text-card-foreground">
            {isNumeric ? (
              <NumberFlow
                value={numericValue}
                prefix={prefix}
                suffix={suffix}
              />
            ) : (
              value
            )}
          </span>
          {tag && (
            <Badge variant="default" className="uppercase ml-3 bg-habitech-pattern">
              {tag}
            </Badge>
          )}
        </div>

        {description && (
          <div className="justify-between">
            <p className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
              {description}
            </p>
          </div>
        )}

        {/* Marquee Animation */}
        {direction && (
          <div className="absolute top-0 right-0 w-14 h-full pointer-events-none overflow-hidden group">
            <div
              className={cn(
                "flex flex-col transition-all duration-500",
                "group-hover:scale-105 group-hover:brightness-110",
                getIntentClassName(),
                direction === "up"
                  ? "animate-marquee-up"
                  : "animate-marquee-down"
              )}
            >
              <div
                className={cn(
                  "flex",
                  direction === "up" ? "flex-col-reverse" : "flex-col"
                )}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Arrow key={i} direction={direction} index={i} />
                ))}
              </div>
              <div
                className={cn(
                  "flex",
                  direction === "up" ? "flex-col-reverse" : "flex-col"
                )}
              >
                {Array.from({ length: 6 }, (_, i) => (
                  <Arrow key={i} direction={direction} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ArrowProps {
  direction: "up" | "down";
  index: number;
}

const Arrow = ({ direction, index }: ArrowProps) => {
  const staggerDelay = index * 0.15; // Faster stagger
  const phaseDelay = (index % 3) * 0.8; // Different phase groups

  return (
    <span
      style={{
        animationDelay: `${staggerDelay + phaseDelay}s`,
        animationDuration: "3s",
        animationTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      }}
      className={cn(
        "text-center text-5xl size-14 font-display leading-none block",
        "transition-all duration-700 ease-out",
        "animate-marquee-pulse",

        "will-change-transform"
      )}
    >
      {direction === "up" ? "↑" : "↓"}
    </span>
  );
};
