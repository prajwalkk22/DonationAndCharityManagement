import { useQuery } from "@tanstack/react-query";
import { FileDown, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import type { CampaignWithStats, FundUsage } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { toast } = useToast();

  const { data: campaignReports, isLoading: campaignsLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: fundUsageReports, isLoading: fundUsageLoading } = useQuery<(FundUsage & { campaignName: string })[]>({
    queryKey: ["/api/admin/fund-usage"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const handleExportCSV = (type: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${type} report to CSV...`,
    });
    // This will be implemented in backend integration
    window.open(`/api/admin/reports/${type}/csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Reports</h1>
        <p className="text-muted-foreground mt-1">View comprehensive reports and analytics</p>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList>
          <TabsTrigger value="campaigns" data-testid="tab-campaigns">Campaign Reports</TabsTrigger>
          <TabsTrigger value="fund-usage" data-testid="tab-fund-usage">Fund Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>Goal vs. collected amounts for all campaigns</CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleExportCSV('campaigns')} data-testid="button-export-campaigns">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !campaignReports || campaignReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No campaigns to report</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead className="text-right">Goal Amount</TableHead>
                        <TableHead className="text-right">Raised</TableHead>
                        <TableHead className="text-right">Progress</TableHead>
                        <TableHead className="text-right">Donors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaignReports.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(campaign.goalAmount)}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums text-primary">
                            {formatCurrency(campaign.totalDonations)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {campaign.progressPercentage}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {campaign.donorCount}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fund-usage">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Fund Usage Report</CardTitle>
                  <CardDescription>Track how campaign funds are being spent</CardDescription>
                </div>
                <Button variant="outline" onClick={() => handleExportCSV('fund-usage')} data-testid="button-export-fund-usage">
                  <FileDown className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {fundUsageLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !fundUsageReports || fundUsageReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No fund usage records yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Amount Spent</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fundUsageReports.map((usage) => (
                        <TableRow key={usage.id}>
                          <TableCell className="font-medium">{usage.campaignName}</TableCell>
                          <TableCell>{usage.description}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {formatCurrency(usage.amountSpent)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(usage.spentAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
