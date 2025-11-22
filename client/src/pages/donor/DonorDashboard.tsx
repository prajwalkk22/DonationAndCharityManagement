import { useQuery } from "@tanstack/react-query";
import { Heart, TrendingUp, Calendar } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CampaignCard } from "@/components/CampaignCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import type { CampaignWithStats } from "@shared/schema";

export default function DonorDashboard() {
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalDonated: string;
    campaignsSupported: number;
    lastDonation: string | null;
  }>({
    queryKey: ["/api/donor/stats"],
  });

  const { data: activeCampaigns, isLoading: campaignsLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const handleDonate = (campaignId: string) => {
    navigate(`/donor/campaigns?donate=${campaignId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your giving impact and discover campaigns</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {statsLoading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <MetricCard
              title="Total Donated"
              value={formatCurrency(stats?.totalDonated || 0)}
              icon={TrendingUp}
              testId="metric-total-donated"
            />
            <MetricCard
              title="Campaigns Supported"
              value={stats?.campaignsSupported || 0}
              icon={Heart}
              testId="metric-campaigns-supported"
            />
            <MetricCard
              title="Last Donation"
              value={stats?.lastDonation ? new Date(stats.lastDonation).toLocaleDateString() : "No donations yet"}
              icon={Calendar}
              testId="metric-last-donation"
            />
          </>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Active Campaigns</h2>
        <p className="text-muted-foreground mb-6">Support causes that matter to you</p>
        
        {campaignsLoading ? (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !activeCampaigns || activeCampaigns.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No active campaigns available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {activeCampaigns.slice(0, 6).map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onDonate={handleDonate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
