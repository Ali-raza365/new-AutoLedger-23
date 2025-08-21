import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Inventory } from "@shared/schema";

interface InventoryTableProps {
  inventory: Inventory[];
  isLoading: boolean;
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-blue-700"
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
