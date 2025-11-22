import { useQuery } from "@tanstack/react-query";
import { Heart, TrendingUp, Users, Calendar } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DonationWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalCampaigns: number;
    totalDonations: string;
    activeVolunteers: number;
    totalRaised: string;
  }>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: recentDonations, isLoading: donationsLoading } = useQuery<DonationWithDetails[]>({
    queryKey: ["/api/admin/recent-donations"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your charity management system</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
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
              title="Total Campaigns"
              value={stats?.totalCampaigns || 0}
              icon={Heart}
              testId="metric-total-campaigns"
            />
            <MetricCard
              title="Total Raised"
              value={formatCurrency(stats?.totalRaised || 0)}
              icon={TrendingUp}
              testId="metric-total-raised"
            />
            <MetricCard
              title="Active Volunteers"
              value={stats?.activeVolunteers || 0}
              icon={Users}
              testId="metric-active-volunteers"
            />
            <MetricCard
              title="Total Donations"
              value={stats?.totalDonations || 0}
              icon={Calendar}
              testId="metric-total-donations"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest donations across all campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          {donationsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !recentDonations || recentDonations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No donations yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDonations.map((donation) => (
                    <TableRow key={donation.id} data-testid={`row-donation-${donation.id}`}>
                      <TableCell className="font-medium">{donation.donor.name}</TableCell>
                      <TableCell>{donation.campaign.name}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(donation.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {donation.receiptId.slice(0, 8)}...
                        </code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
