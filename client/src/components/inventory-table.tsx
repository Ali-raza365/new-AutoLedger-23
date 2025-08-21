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

interface InventoryTableProps {
  inventory: Inventory[];
  isLoading: boolean;
}

function VehicleViewDialog({ vehicle }: { vehicle: Inventory }) {
  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Vehicle Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
            <div className="space-y-2">
              <div><span className="text-gray-600">Stock Number:</span> <span className="font-medium">{vehicle.stockNumber}</span></div>
              <div><span className="text-gray-600">VIN:</span> <span className="font-mono text-sm">{vehicle.vin}</span></div>
              <div><span className="text-gray-600">Year:</span> <span className="font-medium">{vehicle.year}</span></div>
              <div><span className="text-gray-600">Make:</span> <span className="font-medium">{vehicle.make}</span></div>
              <div><span className="text-gray-600">Model:</span> <span className="font-medium">{vehicle.model}</span></div>
              <div><span className="text-gray-600">Series:</span> <span className="font-medium">{vehicle.series || 'N/A'}</span></div>
              <div><span className="text-gray-600">Body:</span> <span className="font-medium">{vehicle.body}</span></div>
              <div><span className="text-gray-600">Color:</span> <span className="font-medium">{vehicle.color}</span></div>
              <div><span className="text-gray-600">Certified:</span> <span className="font-medium">{vehicle.certified ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Pricing & Details</h3>
            <div className="space-y-2">
              <div><span className="text-gray-600">Price:</span> <span className="font-medium">${Number(vehicle.price).toLocaleString()}</span></div>
              <div><span className="text-gray-600">Book Value:</span> <span className="font-medium">${vehicle.bookValue ? Number(vehicle.bookValue).toLocaleString() : 'N/A'}</span></div>
              <div><span className="text-gray-600">Cost:</span> <span className="font-medium">${Number(vehicle.cost).toLocaleString()}</span></div>
              <div><span className="text-gray-600">Markup:</span> <span className="font-medium">${vehicle.markup ? Number(vehicle.markup).toLocaleString() : 'N/A'}</span></div>
              <div><span className="text-gray-600">Odometer:</span> <span className="font-medium">{vehicle.odometer.toLocaleString()} miles</span></div>
              <div><span className="text-gray-600">Age:</span> <span className="font-medium">{vehicle.age || 0} days</span></div>
              <div><span className="text-gray-600">Added:</span> <span className="font-medium">{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString() : 'N/A'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function InventoryTable({ inventory, isLoading }: InventoryTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Stock #</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((vehicle) => (
              <TableRow key={vehicle.id} className="hover:bg-gray-50" data-testid={`row-vehicle-${vehicle.id}`}>
                <TableCell className="font-medium text-primary" data-testid={`text-stock-${vehicle.id}`}>
                  {vehicle.stockNumber}
                </TableCell>
                <TableCell className="text-gray-600 font-mono text-sm" data-testid={`text-vin-${vehicle.id}`}>
                  {vehicle.vin}
                </TableCell>
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
                <TableCell className="text-gray-600" data-testid={`text-color-${vehicle.id}`}>
                  {vehicle.color}
                </TableCell>
                <TableCell className="font-medium text-gray-900" data-testid={`text-price-${vehicle.id}`}>
                  ${Number(vehicle.price).toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600" data-testid={`text-odometer-${vehicle.id}`}>
                  {vehicle.odometer.toLocaleString()} mi
                </TableCell>
                <TableCell className="text-gray-600" data-testid={`text-age-${vehicle.id}`}>
                  {vehicle.age || 0} days
                </TableCell>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-blue-700"
                      onClick={() => toast({
                        title: "Edit Feature",
                        description: "Edit functionality will be available soon",
                      })}
                      data-testid={`button-edit-${vehicle.id}`}
                    >
                      <Edit size={16} />
                    </Button>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
