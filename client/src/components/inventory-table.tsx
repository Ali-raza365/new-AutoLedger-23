import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Inventory } from "@shared/schema";
import InventoryEditForm from "@/components/inventory-edit-form";
import ColumnVisibilityDropdown, { type ColumnDefinition } from "@/components/column-visibility-dropdown";

interface InventoryTableProps {
  inventory: Inventory[];
  isLoading: boolean;
}

const INVENTORY_COLUMNS: ColumnDefinition[] = [
  { key: "stockNumber", label: "Stock #", defaultVisible: true },
  { key: "vin", label: "VIN", defaultVisible: true },
  { key: "vehicle", label: "Vehicle", defaultVisible: true },
  { key: "color", label: "Color", defaultVisible: true },
  { key: "price", label: "Price", defaultVisible: true },
  { key: "odometer", label: "Odometer", defaultVisible: true },
  { key: "age", label: "Age", defaultVisible: true },
  { key: "actions", label: "Actions", defaultVisible: true },
];

function VehicleViewDialog({ vehicle }: { vehicle: Inventory }) {
  const profitMargin = vehicle.markup && vehicle.cost ? ((Number(vehicle.markup) / Number(vehicle.cost)) * 100).toFixed(1) : '0.0';
  
  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
      <DialogHeader className="pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </DialogTitle>
            <p className="text-lg text-gray-600 mt-1">Stock #{vehicle.stockNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">${Number(vehicle.price).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Listed Price</p>
          </div>
        </div>
      </DialogHeader>
      
      <div className="space-y-8 pt-6">
        {/* Vehicle Identification */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Vehicle Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">VIN Number</span>
                <span className="font-mono text-lg text-gray-900 bg-gray-50 px-3 py-2 rounded border">{vehicle.vin}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Year & Make</span>
                <span className="text-lg font-semibold text-gray-900">{vehicle.year} {vehicle.make}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Model & Series</span>
                <span className="text-lg font-semibold text-gray-900">{vehicle.model} {vehicle.series || ''}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Color</span>
                <span className="text-lg font-medium text-gray-900">{vehicle.color}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Body Type</span>
                <span className="text-lg font-medium text-gray-900">{vehicle.body}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Status & Condition */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Vehicle Status</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="mb-2">
                {vehicle.certified ? (
                  <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-medium">
                    ✓ Certified Pre-Owned
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-gray-300">
                    Standard Vehicle
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600">Certification Status</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{vehicle.odometer.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Miles</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <p className="text-2xl font-bold text-orange-600">{vehicle.age || 0}</p>
              <p className="text-sm text-gray-600">Days on Lot</p>
            </div>
          </div>
        </div>
        
        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Financial Details</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Listed Price</p>
              <p className="text-2xl font-bold text-green-600">${Number(vehicle.price).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Book Value</p>
              <p className="text-2xl font-bold text-blue-600">${vehicle.bookValue ? Number(vehicle.bookValue).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Our Cost</p>
              <p className="text-2xl font-bold text-red-600">${Number(vehicle.cost).toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Markup</p>
              <p className="text-2xl font-bold text-purple-600">${vehicle.markup ? Number(vehicle.markup).toLocaleString() : '0'}</p>
              <p className="text-xs text-gray-500 mt-1">{profitMargin}% margin</p>
            </div>
          </div>
        </div>
        
        {/* Record Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm">Added to inventory: </span>
            <span className="font-medium ml-1">{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric' 
            }) : 'Date not available'}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function InventoryTable({ inventory, isLoading }: InventoryTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingVehicle, setEditingVehicle] = useState<Inventory | null>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      initial[col.key] = col.defaultVisible;
    });
    return initial;
  });

  const handleVisibilityChange = (key: string, visible: boolean) => {
    setVisibleColumns(prev => ({ ...prev, [key]: visible }));
  };

  const handleHideAll = () => {
    const hidden: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      hidden[col.key] = false;
    });
    setVisibleColumns(hidden);
  };

  const handleResetToDefault = () => {
    const defaults: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      defaults[col.key] = col.defaultVisible;
    });
    setVisibleColumns(defaults);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, stockNumber: string) => {
    if (confirm(`Are you sure you want to delete vehicle ${stockNumber}?`)) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading inventory...</p>
        </div>
      </Card>
    );
  }

  if (inventory.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-500">No vehicles in inventory</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-end p-4 border-b">
        <ColumnVisibilityDropdown
          columns={INVENTORY_COLUMNS}
          visibleColumns={visibleColumns}
          onVisibilityChange={handleVisibilityChange}
          onHideAll={handleHideAll}
          onResetToDefault={handleResetToDefault}
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {visibleColumns.stockNumber && <TableHead>Stock #</TableHead>}
              {visibleColumns.vin && <TableHead>VIN</TableHead>}
              {visibleColumns.vehicle && <TableHead>Vehicle</TableHead>}
              {visibleColumns.color && <TableHead>Color</TableHead>}
              {visibleColumns.price && <TableHead>Price</TableHead>}
              {visibleColumns.odometer && <TableHead>Odometer</TableHead>}
              {visibleColumns.age && <TableHead>Age</TableHead>}
              {visibleColumns.actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((vehicle) => (
              <TableRow key={vehicle.id} className="hover:bg-gray-50" data-testid={`row-vehicle-${vehicle.id}`}>
                {visibleColumns.stockNumber && (
                  <TableCell className="font-medium text-primary" data-testid={`text-stock-${vehicle.id}`}>
                    {vehicle.stockNumber}
                  </TableCell>
                )}
                {visibleColumns.vin && (
                  <TableCell className="text-gray-600 font-mono text-sm" data-testid={`text-vin-${vehicle.id}`}>
                    {vehicle.vin}
                  </TableCell>
                )}
                {visibleColumns.vehicle && (
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900" data-testid={`text-vehicle-${vehicle.id}`}>
                        {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.series}
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.body}
                        {vehicle.certified && (
                          <Badge variant="secondary" className="ml-2">Certified</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                )}
                {visibleColumns.color && (
                  <TableCell className="text-gray-600" data-testid={`text-color-${vehicle.id}`}>
                    {vehicle.color}
                  </TableCell>
                )}
                {visibleColumns.price && (
                  <TableCell className="font-medium text-gray-900" data-testid={`text-price-${vehicle.id}`}>
                    ${Number(vehicle.price).toLocaleString()}
                  </TableCell>
                )}
                {visibleColumns.odometer && (
                  <TableCell className="text-gray-600" data-testid={`text-odometer-${vehicle.id}`}>
                    {vehicle.odometer.toLocaleString()} mi
                  </TableCell>
                )}
                {visibleColumns.age && (
                  <TableCell className="text-gray-600" data-testid={`text-age-${vehicle.id}`}>
                    {vehicle.age || 0} days
                  </TableCell>
                )}
                {visibleColumns.actions && (
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-blue-700"
                            data-testid={`button-view-${vehicle.id}`}
                          >
                            <Eye size={16} />
                          </Button>
                        </DialogTrigger>
                        <VehicleViewDialog vehicle={vehicle} />
                      </Dialog>
                      <Dialog open={editingVehicle?.id === vehicle.id} onOpenChange={(open) => !open && setEditingVehicle(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-blue-700"
                            onClick={() => setEditingVehicle(vehicle)}
                            data-testid={`button-edit-${vehicle.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          {editingVehicle && (
                            <InventoryEditForm 
                              vehicle={editingVehicle} 
                              onSuccess={() => setEditingVehicle(null)} 
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(vehicle.id, vehicle.stockNumber)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${vehicle.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
