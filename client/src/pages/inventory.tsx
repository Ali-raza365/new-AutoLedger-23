import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Download, Search } from "lucide-react";
import type { Inventory } from "@shared/schema";
import InventoryForm from "@/components/inventory-form";
import InventoryTable from "@/components/inventory-table";

export default function Inventory() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("");

  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = !searchQuery || 
      item.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stockNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMake = !selectedMake || selectedMake === "all" || item.make === selectedMake;
    
    return matchesSearch && matchesMake;
  });

  const uniqueMakes = Array.from(new Set(inventory.map(item => item.make))).sort();

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Car Inventory</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your vehicle inventory</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {/* Inventory Header Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-4">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-vehicle">
                      <Plus className="mr-2" size={16} />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <InventoryForm onSuccess={() => setIsFormOpen(false)} />
                  </DialogContent>
                </Dialog>
                <Button variant="outline" data-testid="button-export">
                  <Download className="mr-2" size={16} />
                  Export
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by VIN, Make, Model..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-inventory"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="w-40" data-testid="select-make-filter">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Inventory Table */}
          <InventoryTable inventory={filteredInventory} isLoading={isLoading} />
        </div>
      </main>
    </>
  );
}
