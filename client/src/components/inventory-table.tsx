import { useState } from "react";
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

interface InventoryTableProps {
  inventory: Inventory[];
  isLoading: boolean;
  visibleColumns: Record<string, boolean>;
}


function VehicleViewDialog({ vehicle }: { vehicle: Inventory }) {
  const profitMargin = vehicle.markup && vehicle.cost ? ((Number(vehicle.markup) / Number(vehicle.cost)) * 100).toFixed(1) : '0.0';

  return (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h3>
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
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg border">
              <div className="mb-2">
                {vehicle.certified ? (
                  <Badge className="px-4 py-2 text-sm font-medium">
                    ✓ Certified Pre-Owned
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                    Standard Vehicle
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600">Certification Status</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">{vehicle.odometer.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Miles</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">{vehicle.age || 0}</p>
              <p className="text-sm text-gray-600">Days on Lot</p>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Listed Price</p>
              <p className="text-2xl font-bold text-gray-900">${Number(vehicle.price).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Book Value</p>
              <p className="text-2xl font-bold text-gray-900">${vehicle.bookValue ? Number(vehicle.bookValue).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Our Cost</p>
              <p className="text-2xl font-bold text-gray-900">${Number(vehicle.cost).toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Markup</p>
              <p className="text-2xl font-bold text-gray-900">${vehicle.markup ? Number(vehicle.markup).toLocaleString() : '0'}</p>
              <p className="text-xs text-gray-500 mt-1">{profitMargin}% margin</p>
            </div>
          </div>
        </div>

        {/* Record Information */}
        <div className="bg-gray-50 rounded-lg p-4 border">
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

export default function InventoryTable({ inventory, isLoading, visibleColumns }: InventoryTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingVehicle, setEditingVehicle] = useState<Inventory | null>(null);


  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/inventory/${id}`, { method: "DELETE" }),
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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {visibleColumns.stockNumber && <TableHead>Stock #</TableHead>}
              {visibleColumns.dateLogged && <TableHead>Date Logged</TableHead>}
              {visibleColumns.vin && <TableHead>VIN</TableHead>}
              {visibleColumns.vehicle && <TableHead>Vehicle</TableHead>}
              {visibleColumns.newUsed && <TableHead>Vehicle Type</TableHead>}
              {visibleColumns.specificSource && <TableHead>Source </TableHead>}

              {visibleColumns.year && <TableHead>Year</TableHead>}
              {visibleColumns.make && <TableHead>Make</TableHead>}
              {visibleColumns.model && <TableHead>Model</TableHead>}
              {visibleColumns.series && <TableHead>Series</TableHead>}
              {visibleColumns.color && <TableHead>Color</TableHead>}
              {visibleColumns.certified && <TableHead>Certified</TableHead>}
              {visibleColumns.body && <TableHead>Body</TableHead>}
              {visibleColumns.price && <TableHead>Price</TableHead>}
              {visibleColumns.bookValue && <TableHead>Book Value</TableHead>}
              {visibleColumns.cost && <TableHead>Cost</TableHead>}
              {visibleColumns.markup && <TableHead>Markup</TableHead>}
              {visibleColumns.hqAppraisalSuggested && <TableHead>HQ Appraisal Suggested</TableHead>}
              {visibleColumns.odometer && <TableHead>Odometer</TableHead>}
              {visibleColumns.age && <TableHead>Age</TableHead>}
              {visibleColumns.actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {inventory.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                className="hover:bg-gray-50"
                data-testid={`row-vehicle-${vehicle.id}`}
              >
                {visibleColumns.stockNumber && (
                  <TableCell className="font-medium text-primary" data-testid={`text-stock-${vehicle.id}`}>
                    {vehicle.stockNumber}
                  </TableCell>
                )}

                {visibleColumns.dateLogged && (
                  <TableCell className="text-gray-600" data-testid={`text-dateLogged-${vehicle.id}`}>
                    {new Date(vehicle.dateLogged).toLocaleDateString()}
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
                {visibleColumns.newUsed && (
                  <TableCell className="text-gray-600" data-testid={`text-body-${vehicle.id}`}>
                    {vehicle.newUsed}
                  </TableCell>
                )}
                {visibleColumns.specificSource && (
                  <TableCell className="text-gray-600" data-testid={`text-body-${vehicle.id}`}>
                    {vehicle.specificSource}
                  </TableCell>
                )}

                {visibleColumns.year && (
                  <TableCell className="text-gray-600" data-testid={`text-year-${vehicle.id}`}>
                    {vehicle.year}
                  </TableCell>
                )}

                {visibleColumns.make && (
                  <TableCell className="text-gray-600" data-testid={`text-make-${vehicle.id}`}>
                    {vehicle.make}
                  </TableCell>
                )}

                {visibleColumns.model && (
                  <TableCell className="text-gray-600" data-testid={`text-model-${vehicle.id}`}>
                    {vehicle.model}
                  </TableCell>
                )}

                {visibleColumns.series && (
                  <TableCell className="text-gray-600" data-testid={`text-series-${vehicle.id}`}>
                    {vehicle.series}
                  </TableCell>
                )}



                {visibleColumns.color && (
                  <TableCell className="text-gray-600" data-testid={`text-color-${vehicle.id}`}>
                    {vehicle.color}
                  </TableCell>
                )}

                {visibleColumns.certified && (
                  <TableCell className="text-gray-600" data-testid={`text-certified-${vehicle.id}`}>
                    {vehicle.certified ? "Yes" : "No"}
                  </TableCell>
                )}

                {visibleColumns.body && (
                  <TableCell className="text-gray-600" data-testid={`text-body-${vehicle.id}`}>
                    {vehicle.body}
                  </TableCell>
                )}

                {visibleColumns.price && (
                  <TableCell className="font-medium text-gray-900" data-testid={`text-price-${vehicle.id}`}>
                    ${Number(vehicle.price).toLocaleString()}
                  </TableCell>
                )}

                {visibleColumns.bookValue && (
                  <TableCell className="text-gray-600" data-testid={`text-bookValue-${vehicle.id}`}>
                    ${Number(vehicle.bookValue).toLocaleString()}
                  </TableCell>
                )}

                {visibleColumns.cost && (
                  <TableCell className="text-gray-600" data-testid={`text-cost-${vehicle.id}`}>
                    ${Number(vehicle.cost).toLocaleString()}
                  </TableCell>
                )}

                {visibleColumns.markup && (
                  <TableCell className="text-gray-600" data-testid={`text-markup-${vehicle.id}`}>
                    ${Number(vehicle.markup).toLocaleString()}
                  </TableCell>
                )}

                {visibleColumns.hqAppraisalSuggested && (
                  <TableCell className="text-gray-600" data-testid={`text-hqAppraisalSuggested-${vehicle.id}`}>
                    {vehicle.hqAppraisalSuggested ? "Yes" : "No"}
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
