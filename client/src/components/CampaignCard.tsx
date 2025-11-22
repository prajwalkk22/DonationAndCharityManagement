import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, Users } from "lucide-react";
import type { CampaignWithStats } from "@shared/schema";

interface CampaignCardProps {
  campaign: CampaignWithStats;
  onDonate?: (campaignId: string) => void;
  onView?: (campaignId: string) => void;
  showDonateButton?: boolean;
}

export function CampaignCard({ campaign, onDonate, onView, showDonateButton = true }: CampaignCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-campaign-${campaign.id}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-card-foreground truncate" data-testid="text-campaign-name">
              {campaign.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {campaign.description}
            </p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 text-primary shrink-0">
            <Heart className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold tabular-nums" data-testid="text-campaign-progress">
              {campaign.progressPercentage}%
            </span>
          </div>
          <Progress value={campaign.progressPercentage} className="h-2" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Goal</p>
            <p className="text-sm font-semibold tabular-nums" data-testid="text-campaign-goal">
              {formatCurrency(Number(campaign.goalAmount))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Raised</p>
            <p className="text-sm font-semibold tabular-nums text-primary" data-testid="text-campaign-raised">
              {formatCurrency(campaign.totalDonations)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Donors</p>
            <p className="text-sm font-semibold tabular-nums" data-testid="text-campaign-donors">
              {campaign.donorCount}
            </p>
          </div>
        </div>
      </CardContent>
      
      {(showDonateButton || onView) && (
        <CardFooter className="flex gap-2 pt-4 border-t border-card-border">
          {onView && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onView(campaign.id)}
              data-testid="button-view-campaign"
            >
              View Details
            </Button>
          )}
          {showDonateButton && onDonate && (
            <Button
              className="flex-1"
              onClick={() => onDonate(campaign.id)}
              data-testid="button-donate"
            >
              Donate Now
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
