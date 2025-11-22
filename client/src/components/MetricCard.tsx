import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  testId?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, testId }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-2xl font-bold tabular-nums" data-testid={testId}>
              {value}
            </p>
            {trend && (
              <p className="text-sm text-muted-foreground mt-1">{trend}</p>
            )}
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
