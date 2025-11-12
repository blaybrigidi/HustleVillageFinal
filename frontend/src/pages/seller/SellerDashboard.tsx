import { Package, Calendar, TrendingUp, DollarSign } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const recentBookings = [
  { id: "BK001", buyer: "John Doe", service: "Web Design", date: "Nov 8, 2025", status: "pending" },
  { id: "BK002", buyer: "Jane Smith", service: "Logo Design", date: "Nov 7, 2025", status: "in_progress" },
  { id: "BK003", buyer: "Mike Johnson", service: "Consulting", date: "Nov 6, 2025", status: "completed" },
];

const upcomingBookings = [
  { id: "BK004", buyer: "Sarah Wilson", service: "Photography", date: "Nov 10, 2025", time: "10:00 AM" },
  { id: "BK005", buyer: "Tom Brown", service: "Video Editing", date: "Nov 11, 2025", time: "2:00 PM" },
];

const statusColors: Record<string, string> = {
  pending: "default",
  in_progress: "secondary",
  completed: "outline",
};

export default function SellerDashboard() {
  return (
    <>
      <DashboardHeader 
        title="Hi, Seller" 
        subtitle="Here's your seller overview and recent activity"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Services"
            value={12}
            icon={Package}
            trend={{ value: "2 this week", isPositive: true }}
          />
          <StatCard
            title="New Booking Requests"
            value={5}
            icon={Calendar}
            trend={{ value: "3 pending", isPositive: false }}
          />
          <StatCard
            title="In-Progress Bookings"
            value={8}
            icon={TrendingUp}
            iconBgColor="bg-secondary-accent/20"
          />
          <StatCard
            title="Earnings This Month"
            value="GH₵ 2,450"
            icon={DollarSign}
            trend={{ value: "+12.5%", isPositive: true }}
            iconBgColor="bg-primary/10"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{booking.buyer}</p>
                      <p className="text-sm text-muted-foreground">{booking.service}</p>
                      <p className="text-xs text-muted-foreground mt-1">{booking.date}</p>
                    </div>
                    <Badge variant={statusColors[booking.status] as any}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Bookings
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Bookings & Tips */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{booking.buyer}</p>
                        <p className="text-sm text-muted-foreground">{booking.service}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {booking.date} at {booking.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-accent-light/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base">Tips to Get More Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Add clear photos to your services</li>
                  <li>• Respond to requests within 24 hours</li>
                  <li>• Keep your availability updated</li>
                  <li>• Ask satisfied clients for reviews</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
