import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  trendValue?: string;
  description?: string;
}

export const MetricCard = ({ title, value, icon, trend, trendValue, description }: MetricCardProps) => {
  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
            {trend && trendValue && (
              <span className={cn(
                "flex items-center text-sm font-medium",
                trend === "up" ? "text-secondary" : "text-destructive"
              )}>
                {trend === "up" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {trendValue}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      </div>
    </Card>
  );
};
