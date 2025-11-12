import { Eye } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const bookings = [
  {
    id: "BK001",
    buyer: "John Doe",
    service: "Web Design",
    date: "Nov 10, 2025",
    time: "10:00 AM",
    status: "new",
    escrowStatus: "pending",
    amount: "GH₵ 500",
  },
  {
    id: "BK002",
    buyer: "Jane Smith",
    service: "Logo Design",
    date: "Nov 8, 2025",
    time: "2:00 PM",
    status: "in_progress",
    escrowStatus: "funded",
    amount: "GH₵ 200",
  },
  {
    id: "BK003",
    buyer: "Mike Johnson",
    service: "Consulting",
    date: "Nov 5, 2025",
    time: "11:00 AM",
    status: "completed",
    escrowStatus: "released",
    amount: "GH₵ 300",
  },
];

const getStatusBadge = (status: string) => {
  const variants: Record<string, any> = {
    new: "default",
    in_progress: "secondary",
    completed: "outline",
    cancelled: "destructive",
  };
  return variants[status] || "default";
};

const getEscrowBadge = (status: string) => {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    funded: "bg-green-100 text-green-800",
    released: "bg-blue-100 text-blue-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function SellerBookings() {
  return (
    <>
      <DashboardHeader 
        title="Bookings" 
        subtitle="Manage all your booking requests and ongoing services"
      />

      <div className="p-6">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="new">New Requests</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Escrow</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.buyer}</TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {booking.date}<br />
                          <span className="text-xs">{booking.time}</span>
                        </TableCell>
                        <TableCell className="font-medium">{booking.amount}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(booking.status)}>
                            {booking.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${getEscrowBadge(booking.escrowStatus)}`}>
                            {booking.escrowStatus}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="new">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No new booking requests at the moment
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_progress">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No in-progress bookings
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed bookings
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
