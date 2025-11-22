import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CampaignCard } from "@/components/CampaignCard";
import { insertDonationSchema, type InsertDonation, type CampaignWithStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function DonorCampaigns() {
  const [location] = useLocation();
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithStats | null>(null);
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm<InsertDonation>({
    resolver: zodResolver(insertDonationSchema),
    defaultValues: {
      campaignId: "",
      amount: "",
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const donateId = params.get('donate');
    if (donateId && campaigns) {
      const campaign = campaigns.find(c => c.id === donateId);
      if (campaign) {
        setSelectedCampaign(campaign);
        form.setValue('campaignId', campaign.id);
      }
    }
  }, [location, campaigns, form]);

  const donateMutation = useMutation({
    mutationFn: async (data: InsertDonation) => {
      return apiRequest("POST", "/api/donor/donations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/donor/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/donor/donations"] });
      toast({
        title: "Donation successful!",
        description: "Thank you for your generous contribution.",
      });
      setSelectedCampaign(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Donation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertDonation) => {
    donateMutation.mutate(data);
  };

  const handleDonate = (campaignId: string) => {
    const campaign = campaigns?.find(c => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
      form.setValue('campaignId', campaign.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Campaigns</h1>
        <p className="text-muted-foreground mt-1">Browse and support active campaigns</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !campaigns || campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No active campaigns available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onDonate={handleDonate}
            />
          ))}
        </div>
      )}

      <Dialog open={!!selectedCampaign} onOpenChange={(open) => {
        if (!open) {
          setSelectedCampaign(null);
          form.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a Donation</DialogTitle>
            <DialogDescription>
              Support {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Campaign</p>
                <p className="text-sm text-muted-foreground">{selectedCampaign?.name}</p>
              </div>
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        data-testid="input-donation-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedCampaign(null);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={donateMutation.isPending} data-testid="button-submit-donation">
                  {donateMutation.isPending ? "Processing..." : "Donate Now"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
