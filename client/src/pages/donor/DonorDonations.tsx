import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Download, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DonationWithDetails } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function DonorDonations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<DonationWithDetails | null>(null);

  const { data: donations, isLoading } = useQuery<DonationWithDetails[]>({
    queryKey: ["/api/donor/donations"],
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const filteredDonations = donations?.filter(donation =>
    donation.campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.receiptId.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDownloadReceipt = (donation: DonationWithDetails) => {
    // This will be implemented in backend
    window.open(`/api/donor/receipt/${donation.id}/pdf`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Donations</h1>
        <p className="text-muted-foreground mt-1">View your donation history and receipts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>All your contributions to campaigns</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search donations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-donations"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No donations found matching your search" : "No donations yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id} data-testid={`row-donation-${donation.id}`}>
                      <TableCell className="font-medium">{donation.campaign.name}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums text-primary">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(donation.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {donation.receiptId.slice(0, 12)}...
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReceipt(donation)}
                            data-testid={`button-view-receipt-${donation.id}`}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceipt(donation)}
                            data-testid={`button-download-receipt-${donation.id}`}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedReceipt} onOpenChange={(open) => {
        if (!open) setSelectedReceipt(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donation Receipt</DialogTitle>
            <DialogDescription>Official receipt for your donation</DialogDescription>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 font-mono">
              <div className="p-6 border rounded-md bg-card space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <h3 className="text-lg font-semibold">DCMS</h3>
                  <Badge>Official Receipt</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Receipt ID</p>
                    <p className="text-sm font-semibold">{selectedReceipt.receiptId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="text-sm">{format(new Date(selectedReceipt.createdAt), 'PPP')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Donor</p>
                    <p className="text-sm">{selectedReceipt.donor.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <p className="text-sm">{selectedReceipt.donor.email}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Campaign</p>
                  <p className="text-sm font-medium mb-4">{selectedReceipt.campaign.name}</p>
                  <div className="bg-primary/5 p-4 rounded-md">
                    <p className="text-xs text-muted-foreground mb-1">Donation Amount</p>
                    <p className="text-2xl font-bold tabular-nums">{formatCurrency(selectedReceipt.amount)}</p>
                  </div>
                </div>
                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>Thank you for your generous donation. This receipt confirms your contribution.</p>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => handleDownloadReceipt(selectedReceipt)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
