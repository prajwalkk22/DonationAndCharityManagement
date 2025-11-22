import { useQuery } from "@tanstack/react-query";
import { Calendar, Users, CheckCircle } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isFuture, isPast } from "date-fns";
import type { EventWithVolunteers } from "@shared/schema";

export default function VolunteerDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    upcomingEvents: number;
    totalEvents: number;
    hoursVolunteered: number;
  }>({
    queryKey: ["/api/volunteer/stats"],
  });

  const { data: myEvents, isLoading: eventsLoading } = useQuery<EventWithVolunteers[]>({
    queryKey: ["/api/volunteer/my-events"],
  });

  const upcomingEvents = myEvents?.filter(event => isFuture(new Date(event.date))) || [];
  const pastEvents = myEvents?.filter(event => isPast(new Date(event.date))) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your volunteer activities and upcoming events</p>
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
              title="Upcoming Events"
              value={stats?.upcomingEvents || 0}
              icon={Calendar}
              testId="metric-upcoming-events"
            />
            <MetricCard
              title="Total Events"
              value={stats?.totalEvents || 0}
              icon={Users}
              testId="metric-total-events"
            />
            <MetricCard
              title="Hours Volunteered"
              value={stats?.hoursVolunteered || 0}
              icon={CheckCircle}
              testId="metric-hours-volunteered"
            />
          </>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          {eventsLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No upcoming events assigned</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="hover-elevate" data-testid={`card-event-${event.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription className="mt-1">{event.description}</CardDescription>
                      </div>
                      <Badge variant="default">Upcoming</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{format(new Date(event.date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{event.volunteerCount} volunteer{event.volunteerCount !== 1 ? 's' : ''} assigned</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {pastEvents.slice(0, 4).map((event) => (
                <Card key={event.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(event.date), 'PPP')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📍</span>
                      <span>{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
