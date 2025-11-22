import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CampaignCard } from "@/components/CampaignCard";
import { insertCampaignSchema, type InsertCampaign, type CampaignWithStats } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function CampaignsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignWithStats | null>(null);
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery<CampaignWithStats[]>({
    queryKey: ["/api/campaigns"],
  });

  const form = useForm<InsertCampaign>({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      description: "",
      goalAmount: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCampaign) => {
      return apiRequest("POST", "/api/admin/campaigns", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign created",
        description: "The campaign has been created successfully.",
      });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCampaign & { id: string }) => {
      return apiRequest("PATCH", `/api/admin/campaigns/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign updated",
        description: "The campaign has been updated successfully.",
      });
      setEditingCampaign(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/campaigns/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCampaign) => {
    if (editingCampaign) {
      updateMutation.mutate({ ...data, id: editingCampaign.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (campaign: CampaignWithStats) => {
    setEditingCampaign(campaign);
    form.reset({
      name: campaign.name,
      description: campaign.description,
      goalAmount: campaign.goalAmount,
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Manage fundraising campaigns</p>
        </div>
        <Dialog open={isCreateOpen || !!editingCampaign} onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingCampaign(null);
            form.reset();
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-campaign">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
              <DialogDescription>
                {editingCampaign ? "Update campaign details" : "Fill in the details to create a new campaign"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Help Build Community Center" data-testid="input-campaign-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Describe the campaign purpose and goals..." rows={4} data-testid="input-campaign-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Amount ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="10000.00" data-testid="input-campaign-goal" />
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
                      setIsCreateOpen(false);
                      setEditingCampaign(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-campaign">
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingCampaign
                      ? "Update Campaign"
                      : "Create Campaign"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
            <p className="text-muted-foreground mb-4">No campaigns yet</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CampaignCard campaign={campaign} showDonateButton={false} />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => handleEdit(campaign)}
                  data-testid={`button-edit-campaign-${campaign.id}`}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handleDelete(campaign.id)}
                  data-testid={`button-delete-campaign-${campaign.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
