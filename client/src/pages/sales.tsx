import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, Search } from "lucide-react";
import type { Sales } from "@shared/schema";
import SalesForm from "@/components/sales-form";
import SalesTable from "@/components/sales-table";

export default function Sales() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sales = [], isLoading } = useQuery<Sales[]>({
    queryKey: ["/api/sales"],
  });

  const filteredSales = sales.filter((item) => {
    const matchesSearch = !searchQuery || 
      item.dealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerNumber && item.customerNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Sales Log</h2>
            <p className="text-sm text-gray-600 mt-1">Track vehicle sales and customer information</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {/* Sales Header Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-4">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-sale">
                      <Plus className="mr-2" size={16} />
                      New Sale
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <SalesForm onSuccess={() => setIsFormOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" data-testid="button-export-sales">
                  <Download className="mr-2" size={16} />
                  Export Sales
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by deal number, customer..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-sales"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <SalesTable sales={filteredSales} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
