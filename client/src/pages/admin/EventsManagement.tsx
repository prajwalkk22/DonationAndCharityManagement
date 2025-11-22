import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertEventSchema, type InsertEvent, type EventWithVolunteers, type User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isFuture } from "date-fns";

export default function EventsManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assigningVolunteers, setAssigningVolunteers] = useState<EventWithVolunteers | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState("");
  const { toast } = useToast();

  const { data: events, isLoading } = useQuery<EventWithVolunteers[]>({
    queryKey: ["/api/admin/events"],
  });

  const { data: volunteers } = useQuery<User[]>({
    queryKey: ["/api/admin/volunteers"],
  });

  const form = useForm<InsertEvent>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEvent) => {
      return apiRequest("POST", "/api/admin/events", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "Event created",
        description: "The event has been created successfully.",
      });
      setIsCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/events/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { volunteerId: string; eventId: string }) => {
      return apiRequest("POST", "/api/admin/volunteer-assignments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/events"] });
      toast({
        title: "Volunteer assigned",
        description: "The volunteer has been assigned to the event.",
      });
      setAssigningVolunteers(null);
      setSelectedVolunteerId("");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign volunteer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEvent) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleAssignVolunteer = () => {
    if (!selectedVolunteerId || !assigningVolunteers) return;
    assignMutation.mutate({
      volunteerId: selectedVolunteerId,
      eventId: assigningVolunteers.id,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Events</h1>
          <p className="text-muted-foreground mt-1">Manage volunteer events</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-event">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>Fill in the details to create a new volunteer event</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Community Food Drive" data-testid="input-event-title" />
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
                        <Textarea {...field} placeholder="Describe the event..." rows={3} data-testid="input-event-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="datetime-local" data-testid="input-event-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123 Main St, City" data-testid="input-event-location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-event">
                    {createMutation.isPending ? "Creating..." : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No events yet</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription className="mt-1">{event.description}</CardDescription>
                  </div>
                  <Badge variant={isFuture(new Date(event.date)) ? "default" : "secondary"}>
                    {isFuture(new Date(event.date)) ? "Upcoming" : "Past"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{format(new Date(event.date), 'PPP p')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>📍</span>
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{event.volunteerCount} volunteer{event.volunteerCount !== 1 ? 's' : ''} assigned</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setAssigningVolunteers(event)}
                    data-testid={`button-assign-volunteer-${event.id}`}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assign Volunteer
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(event.id, event.title)}
                    data-testid={`button-delete-event-${event.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!assigningVolunteers} onOpenChange={(open) => {
        if (!open) {
          setAssigningVolunteers(null);
          setSelectedVolunteerId("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Volunteer</DialogTitle>
            <DialogDescription>
              Select a volunteer to assign to {assigningVolunteers?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedVolunteerId} onValueChange={setSelectedVolunteerId}>
              <SelectTrigger data-testid="select-volunteer">
                <SelectValue placeholder="Select a volunteer" />
              </SelectTrigger>
              <SelectContent>
                {volunteers?.filter(v => v.role === 'VOLUNTEER').map((volunteer) => (
                  <SelectItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.name} ({volunteer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setAssigningVolunteers(null);
                setSelectedVolunteerId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignVolunteer}
              disabled={!selectedVolunteerId || assignMutation.isPending}
              data-testid="button-confirm-assign"
            >
              {assignMutation.isPending ? "Assigning..." : "Assign Volunteer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
