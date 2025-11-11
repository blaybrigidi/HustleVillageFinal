import { SellerSidebar } from "@/components/dashboard/SellerSidebar";
import { Outlet } from "react-router-dom";

export const SellerDashboardLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <SellerSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
