import { Badge } from "@/components/ui/badge";
import DashboardCard from "@/components/dashboard/card";
import type { SecurityStatus as SecurityStatusType } from "@/types/dashboard";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Bullet } from "@/components/ui/bullet";

const securityStatusItemVariants = cva("border rounded-md ring-2 transition-all duration-200 hover-habitech", {
  variants: {
    variant: {
      success: "status-success-habitech border-success/20 ring-success/10",
      warning: "status-warning-habitech border-warning/20 ring-warning/10", 
      destructive: "status-error-habitech border-destructive/20 ring-destructive/10",
    },
  },
  defaultVariants: {
    variant: "success",
  },
});

interface SecurityStatusItemProps
  extends VariantProps<typeof securityStatusItemVariants> {
  title: string;
  value: string;
  status: string;
  className?: string;
}

function SecurityStatusItem({
  title,
  value,
  status,
  variant,
  className,
}: SecurityStatusItemProps) {
  return (
    <div className={cn(securityStatusItemVariants({ variant }), className)}>
      <div className="flex items-center gap-2 py-1 px-2 border-b border-current">
        <Bullet size="sm" variant={variant} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="py-1 px-2.5">
        <div className="text-2xl font-bold mb-1">{value}</div>
        <div className="text-xs opacity-50">{status}</div>
      </div>
    </div>
  );
}

interface SecurityStatusProps {
  statuses: SecurityStatusType[];
}

export default function SecurityStatus({ statuses }: SecurityStatusProps) {
  return (
    <DashboardCard
      title="SECURITY STATUS"
      intent="success"
      addon={<Badge variant="outline-success">ONLINE</Badge>}
    >
      <div className="flex flex-col">
        <div className="max-md:order-1 grid grid-cols:3 md:grid-cols-1 gap-4 py-2 px-1 md:max-w-max">
          {statuses.map((item, index) => (
            <div key={index} className="widget-container">
              <SecurityStatusItem
                title={item.title}
                value={item.value}
                status={item.status}
                variant={item.variant}
              />
            </div>
          ))}
        </div>
        <picture className="md:absolute md:top-0 md:right-0 w-full md:w-auto md:h-full aspect-square min-[2160px]:right-[10%] flex items-center justify-center">
          <div className="gif-container blueprint-background relative w-full h-full flex items-center justify-center border border-white/20 dark:border-white/30">
            <Image
              src="/assets/bot_greenprint.gif"
              alt="Security Status"
              width={1000}
              height={1000}
              quality={90}
              className="blueprint-image size-full object-contain drop-shadow-lg relative z-10"
            />
          </div>
        </picture>
      </div>
    </DashboardCard>
  );
}
