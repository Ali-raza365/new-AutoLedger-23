import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Sales } from "@shared/schema";
import SalesEditForm from "@/components/sales-edit-form";

interface SalesTableProps {
  sales: Sales[];
  isLoading: boolean;
}

function SaleViewDialog({ sale }: { sale: Sales }) {
  const discount = sale.msrp && sale.salesPrice ? (Number(sale.msrp) - Number(sale.salesPrice)) : 0;
  const discountPercent = sale.msrp && discount > 0 ? ((discount / Number(sale.msrp)) * 100).toFixed(1) : '0.0';
  
  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-green-50">
      <DialogHeader className="pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Sale #{sale.dealNumber}
            </DialogTitle>
            <p className="text-lg text-gray-600 mt-1">{sale.firstName} {sale.lastName} • Stock #{sale.stockNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">${Number(sale.salesPrice).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Final Sale Price</p>
            {discount > 0 && (
              <p className="text-xs text-red-500 mt-1">-${discount.toLocaleString()} ({discountPercent}% off MSRP)</p>
            )}
          </div>
        </div>
      </DialogHeader>
      
      <div className="space-y-8 pt-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
              <p className="text-xl font-bold text-blue-600">{sale.firstName} {sale.lastName}</p>
              <p className="text-xs text-gray-500 mt-1">#{sale.customerNumber || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-gray-600 mb-1">ZIP Code</p>
              <p className="text-xl font-bold text-purple-600">{sale.zip || 'Not provided'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Vehicle Type</p>
              <p className="text-xl font-bold text-green-600">{sale.newUsed}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Exterior Color</p>
              <p className="text-xl font-bold text-orange-600">{sale.exteriorColor || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Vehicle & Delivery Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Vehicle & Delivery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">#{sale.stockNumber}</p>
              <p className="text-sm text-gray-600">Stock Number</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">
                {sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString('en-US', { 
                  month: 'short', day: 'numeric', year: 'numeric' 
                }) : 'Not set'}
              </p>
              <p className="text-sm text-gray-600">Delivery Date</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <p className="text-2xl font-bold text-purple-600">{sale.deliveryMileage ? sale.deliveryMileage.toLocaleString() : 'N/A'}</p>
              <p className="text-sm text-gray-600">Delivery Miles</p>
            </div>
          </div>
        </div>
        
        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Pricing Details</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-1">MSRP</p>
              <p className="text-2xl font-bold text-gray-600">${sale.msrp ? Number(sale.msrp).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-600 mb-1">List Price</p>
              <p className="text-2xl font-bold text-blue-600">${sale.listPrice ? Number(sale.listPrice).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-600 mb-1">Final Sale Price</p>
              <p className="text-2xl font-bold text-green-600">${Number(sale.salesPrice).toLocaleString()}</p>
              {discount > 0 && (
                <p className="text-xs text-gray-500 mt-1">Saved ${discount.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Trade-in Information */}
        {(sale.trade1Vin || sale.trade2Vin) && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Trade-in Vehicles</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sale.trade1Vin && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-700 mb-3">Trade-in #1</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-gray-600">VIN:</span> <span className="font-mono text-sm">{sale.trade1Vin}</span></p>
                    <p><span className="text-sm text-gray-600">Vehicle:</span> <span className="font-medium">{sale.trade1Year} {sale.trade1Make} {sale.trade1Model}</span></p>
                    <p><span className="text-sm text-gray-600">Mileage:</span> <span className="font-medium">{sale.trade1Odometer ? sale.trade1Odometer.toLocaleString() : 'N/A'} miles</span></p>
                    <p><span className="text-sm text-gray-600">ACV:</span> <span className="font-bold text-orange-600">${sale.trade1ACV ? Number(sale.trade1ACV).toLocaleString() : 'N/A'}</span></p>
                  </div>
                </div>
              )}
              {sale.trade2Vin && (
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-700 mb-3">Trade-in #2</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-gray-600">VIN:</span> <span className="font-mono text-sm">{sale.trade2Vin}</span></p>
                    <p><span className="text-sm text-gray-600">Vehicle:</span> <span className="font-medium">{sale.trade2Year} {sale.trade2Make} {sale.trade2Model}</span></p>
                    <p><span className="text-sm text-gray-600">Mileage:</span> <span className="font-medium">{sale.trade2Odometer ? sale.trade2Odometer.toLocaleString() : 'N/A'} miles</span></p>
                    <p><span className="text-sm text-gray-600">ACV:</span> <span className="font-bold text-yellow-600">${sale.trade2ACV ? Number(sale.trade2ACV).toLocaleString() : 'N/A'}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Staff Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
            <h3 className="text-xl font-semibold text-gray-900">Staff Team</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Closing Manager</p>
              <p className="text-lg font-bold text-blue-600">{sale.closingManagerName || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">#{sale.closingManagerNumber || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Finance Manager</p>
              <p className="text-lg font-bold text-green-600">{sale.financeManagerName || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">#{sale.financeManagerNumber || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-200 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Salesperson</p>
              <p className="text-lg font-bold text-purple-600">{sale.salesmanName || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">#{sale.salesmanNumber || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Record Information */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center text-gray-600">
            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm">Sale recorded: </span>
            <span className="font-medium ml-1">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : 'Date not available'}</span>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function SalesTable({ sales, isLoading }: SalesTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSale, setEditingSale] = useState<Sales | null>(null);

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading sales records...</p>
        </div>
      </Card>
    );
  }

  if (sales.length === 0) {
    return (
      <Card>
        <div className="p-8 text-center">
          <p className="text-gray-500">No sales records found</p>
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
              <TableHead>Deal #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Sale Price</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Salesman</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((sale) => (
              <TableRow key={sale.id} className="hover:bg-gray-50" data-testid={`row-sale-${sale.id}`}>
                <TableCell className="font-medium text-primary" data-testid={`text-deal-${sale.id}`}>
                  {sale.dealNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900" data-testid={`text-customer-${sale.id}`}>
                      {sale.firstName} {sale.lastName}
                    </div>
                    {sale.customerNumber && (
                      <div className="text-sm text-gray-500">{sale.customerNumber}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900" data-testid={`text-stock-${sale.id}`}>
                      Stock #{sale.stockNumber}
                    </div>
                    <div className="text-sm text-gray-500">
                      {sale.newUsed} • {sale.exteriorColor}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900" data-testid={`text-price-${sale.id}`}>
                  ${Number(sale.salesPrice).toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600" data-testid={`text-delivery-${sale.id}`}>
                  {sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString() : 'Not set'}
                </TableCell>
                <TableCell className="text-gray-600" data-testid={`text-salesman-${sale.id}`}>
                  {sale.salesmanName || 'Not assigned'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-blue-700"
                          data-testid={`button-view-${sale.id}`}
                        >
                          <Eye size={16} />
                        </Button>
                      </DialogTrigger>
                      <SaleViewDialog sale={sale} />
                    </Dialog>
                    <Dialog open={editingSale?.id === sale.id} onOpenChange={(open) => !open && setEditingSale(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:text-blue-700"
                          onClick={() => setEditingSale(sale)}
                          data-testid={`button-edit-sale-${sale.id}`}
                        >
                          <Edit size={16} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        {editingSale && (
                          <SalesEditForm 
                            sale={editingSale} 
                            onSuccess={() => setEditingSale(null)} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>
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
