import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { HostToursTable } from "@/components/module/Tour/HostToursTable";
import HostTourStats from "@/components/module/Tour/HostTourStats";
import { getMyTours, getMyTourStats } from "@/services/tour/hostTours";

async function ToursContent() {
  const [toursResponse, statsResponse] = await Promise.all([
    getMyTours(),
    getMyTourStats()
  ]);
  console.log(toursResponse);
  

  const tours = toursResponse?.data || [];
  const stats = statsResponse?.data || null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tours</h1>
          <p className="text-muted-foreground mt-2">
            Manage your tours, view statistics, and track performance
          </p>
        </div>
        {/* <CreateTourButton /> */}
      </div>

      {stats && <HostTourStats stats={stats} />}
      
      <Card>
        <CardHeader>
          <CardTitle>All Tours</CardTitle>
          <CardDescription>
            View, edit, and manage all your tour listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HostToursTable tours={tours} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function HostToursPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<TableSkeleton columns={8} rows={10} />}>
        <ToursContent />
      </Suspense>
    </div>
  );
}