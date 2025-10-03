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
  // Utility function for safe number formatting
  const formatNumber = (value: string | number | null | undefined, decimals: number = 0, currency: boolean = false): string => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return currency ? '$0' : 'N/A';
    }
    const num = Number(value);
    if (isNaN(num)) {
      return currency ? 'N/A' : 'N/A';
    }
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };
    if (currency) {
      options.style = 'currency';
      options.currency = 'USD'; // Assuming USD
    } else if (decimals > 0) {
      options.style = 'decimal';
    } else {
      options.style = 'decimal';
      options.maximumFractionDigits = 0;
    }

    // Explicitly handle currency formatting if it's not 'N/A'
    const formatted = num.toLocaleString('en-US', options);

    // If currency is true and toLocaleString didn't add the '$', add it manually for fields that could be 0
    if (currency && !formatted.startsWith('$')) {
        return `$${formatted}`;
    }

    return formatted;
  };

  // Calculation for profit margin (already in original code, slightly modified for safety)
  const profitMargin = vehicle.markup && vehicle.cost && Number(vehicle.cost) !== 0
    ? ((Number(vehicle.markup) / Number(vehicle.cost)) * 100).toFixed(1)
    : '0.0';

  // Helper component for a consistent data display block
  const DataBlock = ({ label, value, className = '' }: { label: string, value: React.ReactNode, className?: string }) => (
    <div className={className}>
      <span className="text-sm font-medium text-gray-500 uppercase tracking-wide block">{label}</span>
      <span className="text-lg font-semibold text-gray-900 block mt-1">{value}</span>
    </div>
  );

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
            <p className="text-3xl font-bold text-green-600">{formatNumber(vehicle.price, 0, true)}</p>
            <p className="text-sm text-gray-500">Listed Price</p>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-8 pt-6">

        {/* Vehicle Identification - Updated with Series Detail, Vehicle Type, Interior Description, Exit Strategy */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataBlock label="VIN Number" value={<span className="font-mono text-lg bg-gray-50 px-3 py-2 rounded border">{vehicle.vin}</span>} className="lg:col-span-2"/>

            <div className="space-y-3">
              <DataBlock label="Year & Make" value={`${vehicle.year} ${vehicle.make}`} />
              <DataBlock label="Model & Series" value={`${vehicle.model} ${vehicle.series || ''}`} />
            </div>
            <div className="space-y-3">
              <DataBlock label="Series Detail" value={vehicle.seriesDetail || 'N/A'} />
              <DataBlock label="Body Type" value={vehicle.body || 'N/A'} />
            </div>
          </div>
        </div>

        {/* Additional Vehicle Details - New Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DataBlock label="Color" value={vehicle.color || 'N/A'} />
            <DataBlock label="Interior Description" value={vehicle.interiorDescription || 'N/A'} />
            <DataBlock label="Vehicle Type" value={vehicle.newUsed || 'N/A'} />
            <DataBlock label="Exit Strategy" value={vehicle.exitStrategy || 'N/A'} />
          </div>
        </div>

        {/* Vehicle Status & Condition - Updated with Current Status & Status Date */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center p-4 rounded-lg border md:col-span-1">
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
              <p className="text-2xl font-bold text-gray-900">{vehicle.odometer ? vehicle.odometer.toLocaleString() : 'N/A'}</p>
              <p className="text-sm text-gray-600">Miles</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">{vehicle.age || 0}</p>
              <p className="text-sm text-gray-600">Days on Lot</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-lg font-bold text-gray-900">{vehicle.currentStatus || 'N/A'}</p>
              <p className="text-sm text-gray-600">Current Status</p>
              {vehicle.statusDate && (
                <p className="text-xs text-gray-500 mt-1">
                  Since: {new Date(vehicle.statusDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">{vehicle.overall || 'N/A'}</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown - Enhanced with more cost and price fields */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Listed Price</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.price, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border bg-blue-50">
              <p className="text-sm font-medium text-blue-800 mb-1">Pending Price</p>
              <p className="text-xl font-bold text-blue-900">{formatNumber(vehicle.pendingPrice, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Book Value</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.bookValue, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Original Cost</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.originalCost, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Our Cost</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.cost, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Applicable Cost</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.applicableCost, 0, true)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            <div className="p-4 rounded-lg border bg-green-50">
              <p className="text-sm font-medium text-green-800 mb-1">Markup</p>
              <p className="text-xl font-bold text-green-900">{formatNumber(vehicle.markup, 0, true)}</p>
              <p className="text-xs text-gray-500 mt-1">{profitMargin}% margin</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Cost Difference</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.costDifference, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Water</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.water, 0, true)}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Applicable Water</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(vehicle.applicableWater, 0, true)}</p>
            </div>
          </div>
        </div>

        {/* Market & Valuation - New Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Market & Valuation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Price Rank</p>
              <p className="text-2xl font-bold text-gray-900">{vehicle.priceRank || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Bucket: {vehicle.priceRankBucket || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">vRank</p>
              <p className="text-2xl font-bold text-gray-900">{vehicle.vRank || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Bucket: {vehicle.vRankBucket || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Mkt Days Supply</p>
              <p className="text-2xl font-bold text-gray-900">{vehicle.marketDaysSupplyLikeMine || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Like Mine</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">% Cost to Market</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicle.costToMarketPct ? `${vehicle.costToMarketPct}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Applicable: {vehicle.applicableCostToMarketPct ? `${vehicle.applicableCostToMarketPct}%` : 'N/A'}</p>
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
              {visibleColumns.vin && <TableHead>VIN</TableHead>}
              {visibleColumns.year && <TableHead>Year</TableHead>}
              {visibleColumns.make && <TableHead>Make</TableHead>}
              {visibleColumns.model && <TableHead>Model</TableHead>}
              {visibleColumns.series && <TableHead>Series</TableHead>}
              {visibleColumns.seriesDetail && <TableHead>Series Detail</TableHead>}
              {visibleColumns.color && <TableHead>Color</TableHead>}
              {visibleColumns.interiorDescription && <TableHead>Interior Description</TableHead>}
              {visibleColumns.exitStrategy && <TableHead>Exit Strategy</TableHead>}
              {visibleColumns.certified && <TableHead>Certified</TableHead>}
              {visibleColumns.newUsed && <TableHead>Vehicle Type</TableHead>}
              {visibleColumns.body && <TableHead>Body</TableHead>}
              {visibleColumns.price && <TableHead>Price</TableHead>}
              {visibleColumns.pendingPrice && <TableHead>Pending Price</TableHead>}
              {visibleColumns.bookValue && <TableHead>Book Value</TableHead>}
              {visibleColumns.cost && <TableHead>Cost</TableHead>}
              {visibleColumns.applicableCost && <TableHead>Applicable Cost</TableHead>}
              {visibleColumns.originalCost && <TableHead>Original Cost</TableHead>}
              {visibleColumns.costDifference && <TableHead>Cost Difference</TableHead>}
              {visibleColumns.markup && <TableHead>Markup</TableHead>}
              {visibleColumns.water && <TableHead>Water</TableHead>}
              {visibleColumns.applicableWater && <TableHead>Applicable Water</TableHead>}
              {visibleColumns.overall && <TableHead>Overall</TableHead>}
              {visibleColumns.marketDaysSupplyLikeMine && <TableHead>Market Days Supply Like Mine</TableHead>}
              {visibleColumns.costToMarketPct && <TableHead>% Cost To Market</TableHead>}
              {visibleColumns.applicableCostToMarketPct && <TableHead>Applicable % Cost To Market</TableHead>}
              {visibleColumns.marketPct && <TableHead>% Mkt</TableHead>}
              {visibleColumns.odometer && <TableHead>Odometer</TableHead>}
              {visibleColumns.age && <TableHead>Age</TableHead>}
              {visibleColumns.priceRank && <TableHead>Price Rank</TableHead>}
              {visibleColumns.vRank && <TableHead>vRank</TableHead>}
              {visibleColumns.priceRankBucket && <TableHead>Price Rank Bucket</TableHead>}
              {visibleColumns.vRankBucket && <TableHead>vRank Bucket</TableHead>}
              {visibleColumns.currentStatus && <TableHead>Current Status</TableHead>}
              {visibleColumns.statusDate && <TableHead>Status Date</TableHead>}
              {/* {visibleColumns.dateLogged && <TableHead>Date Logged</TableHead>} */}
              {visibleColumns.createdAt && <TableHead>Created At</TableHead>}
              {visibleColumns.actions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {inventory.map((vehicle) => (
              <TableRow key={vehicle.id} className="hover:bg-gray-50">
                {visibleColumns.stockNumber && <TableCell>{vehicle.stockNumber}</TableCell>}
                {visibleColumns.vin && <TableCell className="font-mono text-sm">{vehicle.vin}</TableCell>}
                {visibleColumns.year && <TableCell>{vehicle.year}</TableCell>}
                {visibleColumns.make && <TableCell>{vehicle.make}</TableCell>}
                {visibleColumns.model && <TableCell>{vehicle.model}</TableCell>}
                {visibleColumns.series && <TableCell>{vehicle.series}</TableCell>}
                {visibleColumns.seriesDetail && <TableCell>{vehicle.seriesDetail}</TableCell>}
                {visibleColumns.color && <TableCell>{vehicle.color}</TableCell>}
                {visibleColumns.interiorDescription && <TableCell>{vehicle.interiorDescription}</TableCell>}
                {visibleColumns.exitStrategy && <TableCell>{vehicle.exitStrategy}</TableCell>}
                {visibleColumns.certified && <TableCell>{vehicle.certified ? "Yes" : "No"}</TableCell>}
                {visibleColumns.newUsed && <TableCell>{vehicle.newUsed}</TableCell>}
                {visibleColumns.body && <TableCell>{vehicle.body}</TableCell>}
                {visibleColumns.price && <TableCell>${Number(vehicle.price).toLocaleString()}</TableCell>}
                {visibleColumns.pendingPrice && <TableCell>${Number(vehicle.pendingPrice).toLocaleString()}</TableCell>}
                {visibleColumns.bookValue && <TableCell>${Number(vehicle.bookValue).toLocaleString()}</TableCell>}
                {visibleColumns.cost && <TableCell>${Number(vehicle.cost).toLocaleString()}</TableCell>}
                {visibleColumns.applicableCost && <TableCell>${Number(vehicle.applicableCost).toLocaleString()}</TableCell>}
                {visibleColumns.originalCost && <TableCell>${Number(vehicle.originalCost).toLocaleString()}</TableCell>}
                {visibleColumns.costDifference && <TableCell>${Number(vehicle.costDifference).toLocaleString()}</TableCell>}
                {visibleColumns.markup && <TableCell>${Number(vehicle.markup).toLocaleString()}</TableCell>}
                {visibleColumns.water && <TableCell>${Number(vehicle.water).toLocaleString()}</TableCell>}
                {visibleColumns.applicableWater && <TableCell>${Number(vehicle.applicableWater).toLocaleString()}</TableCell>}
                {visibleColumns.overall && <TableCell>{vehicle.overall}</TableCell>}
                {visibleColumns.marketDaysSupplyLikeMine && <TableCell>{vehicle.marketDaysSupplyLikeMine}</TableCell>}
                {visibleColumns.costToMarketPct && <TableCell>{vehicle.costToMarketPct}%</TableCell>}
                {visibleColumns.applicableCostToMarketPct && <TableCell>{vehicle.applicableCostToMarketPct}%</TableCell>}
                {visibleColumns.marketPct && <TableCell>{vehicle.marketPct}%</TableCell>}
                {visibleColumns.odometer && <TableCell>{vehicle.odometer?.toLocaleString()}</TableCell>}
                {visibleColumns.age && <TableCell>{vehicle.age}</TableCell>}
                {visibleColumns.priceRank && <TableCell>{vehicle.priceRank}</TableCell>}
                {visibleColumns.vRank && <TableCell>{vehicle.vRank}</TableCell>}
                {visibleColumns.priceRankBucket && <TableCell>{vehicle.priceRankBucket}</TableCell>}
                {visibleColumns.vRankBucket && <TableCell>{vehicle.vRankBucket}</TableCell>}
                {visibleColumns.currentStatus && <TableCell>{vehicle.currentStatus}</TableCell>}
                {visibleColumns.statusDate && <TableCell>{new Date(vehicle.statusDate).toLocaleDateString()}</TableCell>}
                {/* {visibleColumns.dateLogged && <TableCell>{new Date(vehicle.dateLogged).toLocaleDateString()}</TableCell>} */}
                {visibleColumns.createdAt && <TableCell>{new Date(vehicle.createdAt).toLocaleDateString()}</TableCell>}

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
