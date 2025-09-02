"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TVNoise from "@/components/ui/tv-noise";
import type { WidgetData } from "@/types/dashboard";
import Image from "next/image";

interface WidgetProps {
  widgetData: WidgetData;
}

export default function Widget({ widgetData }: WidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const restOfDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return { dayOfWeek, restOfDate };
  };

  const dateInfo = formatDate(currentTime);

  return (
    <Card className="glass-habitech w-full aspect-[2] relative overflow-hidden">
      <TVNoise opacity={0.2} intensity={0.15} speed={50} />
      <CardContent className="bg-habitech-pattern backdrop-blur-sm flex-1 flex flex-col justify-between text-sm font-medium uppercase relative z-20">
        <div className="flex justify-between items-center">
          <span className="opacity-60">{dateInfo.dayOfWeek}</span>
          <span className="text-primary font-semibold">{dateInfo.restOfDate}</span>
        </div>
        <div className="text-center">
          <div className="text-5xl font-display text-foreground drop-shadow-sm" suppressHydrationWarning>
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="opacity-60">{widgetData.temperature}</span>
          <span className="text-foreground font-semibold">{widgetData.location}</span>

          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            {widgetData.timezone}
          </Badge>
        </div>

        <div className="absolute inset-0 -z-[1] opacity-30 dark:opacity-50">
          <div className="gif-container blueprint-background relative w-full h-full">
            <Image
              src="/assets/pc_blueprint.gif"
              alt="logo"
              width={250}
              height={250}
              className="blueprint-image size-full object-contain relative z-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
