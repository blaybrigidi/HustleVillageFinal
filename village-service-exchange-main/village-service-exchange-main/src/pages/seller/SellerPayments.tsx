import { DollarSign, TrendingUp, Clock } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const earningsHistory = [
  {
    id: "1",
    date: "Nov 7, 2025",
    bookingId: "BK003",
    service: "Web Design",
    amount: "GH₵ 500",
    type: "Released",
  },
  {
    id: "2",
    date: "Nov 5, 2025",
    bookingId: "BK002",
    service: "Logo Design",
    amount: "GH₵ 200",
    type: "Released",
  },
  {
    id: "3",
    date: "Nov 3, 2025",
    bookingId: "BK001",
    service: "Consulting",
    amount: "GH₵ 150",
    type: "Partial Refund",
  },
];

const escrowItems = [
  {
    bookingId: "BK004",
    buyer: "Sarah Wilson",
    amount: "GH₵ 300",
    status: "Funded",
    expectedRelease: "Nov 12, 2025",
  },
  {
    bookingId: "BK005",
    buyer: "Tom Brown",
    amount: "GH₵ 450",
    status: "Funded",
    expectedRelease: "Nov 15, 2025",
  },
];

export default function SellerPayments() {
  return (
    <>
      <DashboardHeader 
        title="Payments & Earnings" 
        subtitle="Track your income, escrow, and payment history"
      />

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Available to Withdraw"
            value="GH₵ 1,850"
            icon={DollarSign}
            iconBgColor="bg-primary/10"
          />
          <StatCard
            title="In Escrow"
            value="GH₵ 750"
            icon={Clock}
            iconBgColor="bg-secondary-accent/20"
          />
          <StatCard
            title="Total Earned This Month"
            value="GH₵ 2,450"
            icon={TrendingUp}
            trend={{ value: "+12.5%", isPositive: true }}
          />
        </div>

        {/* Earnings History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Earnings History</CardTitle>
              <Button variant="outline" size="sm">Export</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsHistory.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>{earning.date}</TableCell>
                    <TableCell className="font-medium">{earning.bookingId}</TableCell>
                    <TableCell>{earning.service}</TableCell>
                    <TableCell className="font-medium text-primary">{earning.amount}</TableCell>
                    <TableCell>
                      <span className={`text-sm ${earning.type === "Released" ? "text-green-600" : "text-yellow-600"}`}>
                        {earning.type}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Escrow Section */}
        <Card>
          <CardHeader>
            <CardTitle>Funds in Escrow</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Escrow Status</TableHead>
                  <TableHead>Expected Release</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escrowItems.map((item) => (
                  <TableRow key={item.bookingId}>
                    <TableCell className="font-medium">{item.bookingId}</TableCell>
                    <TableCell>{item.buyer}</TableCell>
                    <TableCell className="font-medium">{item.amount}</TableCell>
                    <TableCell>
                      <span className="text-sm text-green-600">{item.status}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.expectedRelease}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button size="lg" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Withdraw Funds
          </Button>
        </div>
      </div>
    </>
  );
}
