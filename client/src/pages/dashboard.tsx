import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Handshake, DollarSign, Clock } from "lucide-react";

interface Stats {
  totalInventory: number;
  salesThisMonth: number;
  revenue: number;
  avgDaysInLot: number;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of your dealership operations</p>
          </div>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">JS</span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">John Smith</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Car className="text-2xl text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Inventory</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-total-inventory">
                      {isLoading ? "..." : stats?.totalInventory || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Handshake className="text-2xl text-accent" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sales This Month</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-sales-month">
                      {isLoading ? "..." : stats?.salesThisMonth || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="text-2xl text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-revenue">
                      {isLoading ? "..." : `$${(stats?.revenue || 0).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="text-2xl text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Days in Lot</p>
                    <p className="text-2xl font-semibold text-gray-900" data-testid="stat-avg-days">
                      {isLoading ? "..." : stats?.avgDaysInLot || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Welcome to DealerPro</h3>
            </div>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Get Started</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by adding vehicles to your inventory or recording sales.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
