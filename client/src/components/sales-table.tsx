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
  visibleColumns: Record<string, boolean>;
}


function SaleViewDialog({ sale }: { sale: Sales }) {
  const discount = sale.msrp && sale.salesPrice ? (Number(sale.msrp) - Number(sale.salesPrice)) : 0;
  const discountPercent = sale.msrp && discount > 0 ? ((discount / Number(sale.msrp)) * 100).toFixed(1) : '0.0';
  
  return (
    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Customer</p>
              <p className="text-xl font-bold text-gray-900">{sale.firstName} {sale.lastName}</p>
              <p className="text-xs text-gray-500 mt-1">#{sale.customerNumber || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">ZIP Code</p>
              <p className="text-xl font-bold text-gray-900">{sale.zip || 'Not provided'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Vehicle Type</p>
              <p className="text-xl font-bold text-gray-900">{sale.newUsed}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Exterior Color</p>
              <p className="text-xl font-bold text-gray-900">{sale.exteriorColor || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Vehicle & Delivery Details */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Vehicle & Delivery</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">#{sale.stockNumber}</p>
              <p className="text-sm text-gray-600">Stock Number</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">
                {sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString('en-US', { 
                  month: 'short', day: 'numeric', year: 'numeric' 
                }) : 'Not set'}
              </p>
              <p className="text-sm text-gray-600">Delivery Date</p>
            </div>
            <div className="text-center p-4 rounded-lg border">
              <p className="text-2xl font-bold text-gray-900">{sale.deliveryMileage ? sale.deliveryMileage.toLocaleString() : 'N/A'}</p>
              <p className="text-sm text-gray-600">Delivery Miles</p>
            </div>
          </div>
        </div>
        
        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">MSRP</p>
              <p className="text-2xl font-bold text-gray-900">${sale.msrp ? Number(sale.msrp).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">List Price</p>
              <p className="text-2xl font-bold text-gray-900">${sale.listPrice ? Number(sale.listPrice).toLocaleString() : 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 mb-1">Final Sale Price</p>
              <p className="text-2xl font-bold text-gray-900">${Number(sale.salesPrice).toLocaleString()}</p>
              {discount > 0 && (
                <p className="text-xs text-gray-500 mt-1">Saved ${discount.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Trade-in Information */}
        {(sale.trade1Vin || sale.trade2Vin) && (
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Trade-in Vehicles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sale.trade1Vin && (
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-3">Trade-in #1</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-gray-600">VIN:</span> <span className="font-mono text-sm">{sale.trade1Vin}</span></p>
                    <p><span className="text-sm text-gray-600">Vehicle:</span> <span className="font-medium">{sale.trade1Year} {sale.trade1Make} {sale.trade1Model}</span></p>
                    <p><span className="text-sm text-gray-600">Mileage:</span> <span className="font-medium">{sale.trade1Odometer ? sale.trade1Odometer.toLocaleString() : 'N/A'} miles</span></p>
                    <p><span className="text-sm text-gray-600">ACV:</span> <span className="font-bold text-gray-900">${sale.trade1ACV ? Number(sale.trade1ACV).toLocaleString() : 'N/A'}</span></p>
                  </div>
                </div>
              )}
              {sale.trade2Vin && (
                <div className="p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-3">Trade-in #2</h4>
                  <div className="space-y-2">
                    <p><span className="text-sm text-gray-600">VIN:</span> <span className="font-mono text-sm">{sale.trade2Vin}</span></p>
                    <p><span className="text-sm text-gray-600">Vehicle:</span> <span className="font-medium">{sale.trade2Year} {sale.trade2Make} {sale.trade2Model}</span></p>
                    <p><span className="text-sm text-gray-600">Mileage:</span> <span className="font-medium">{sale.trade2Odometer ? sale.trade2Odometer.toLocaleString() : 'N/A'} miles</span></p>
                    <p><span className="text-sm text-gray-600">ACV:</span> <span className="font-bold text-gray-900">${sale.trade2ACV ? Number(sale.trade2ACV).toLocaleString() : 'N/A'}</span></p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Staff Information */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Staff Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Closing Manager</p>
              <p className="text-lg font-bold text-gray-900">{sale.closingManagerName || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">#{sale.closingManagerNumber || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Finance Manager</p>
              <p className="text-lg font-bold text-gray-900">{sale.financeManagerName || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">#{sale.financeManagerNumber || 'N/A'}</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Salesperson</p>
              <p className="text-lg font-bold text-gray-900">{sale.salesmanName || 'Not assigned'}</p>
              <p className="text-xs text-gray-500">#{sale.salesmanNumber || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        {/* Record Information */}
        <div className="bg-gray-50 rounded-lg p-4 border">
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

export default function SalesTable({ sales, isLoading, visibleColumns }: SalesTableProps) {
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
          {visibleColumns.dealNumber && <TableHead>Deal #</TableHead>}
          {visibleColumns.customerNumber && <TableHead>Customer #</TableHead>}
          {visibleColumns.firstName && <TableHead>First Name</TableHead>}
          {visibleColumns.lastName && <TableHead>Last Name</TableHead>}
          {visibleColumns.zip && <TableHead>ZIP</TableHead>}
          {visibleColumns.exteriorColor && <TableHead>Exterior Color</TableHead>}
          {visibleColumns.newUsed && <TableHead>New/Used</TableHead>}
          {visibleColumns.stockNumber && <TableHead>Stock #</TableHead>}
          {visibleColumns.deliveryDate && <TableHead>Delivery Date</TableHead>}
          {visibleColumns.deliveryMileage && <TableHead>Delivery Mileage</TableHead>}
          {visibleColumns.trade1Vin && <TableHead>Trade 1 VIN</TableHead>}
          {visibleColumns.trade1Year && <TableHead>Trade 1 Year</TableHead>}
          {visibleColumns.trade1Make && <TableHead>Trade 1 Make</TableHead>}
          {visibleColumns.trade1Model && <TableHead>Trade 1 Model</TableHead>}
          {visibleColumns.trade1Odometer && <TableHead>Trade 1 Odometer</TableHead>}
          {visibleColumns.trade1ACV && <TableHead>Trade 1 ACV</TableHead>}
          {visibleColumns.trade2Vin && <TableHead>Trade 2 VIN</TableHead>}
          {visibleColumns.trade2Year && <TableHead>Trade 2 Year</TableHead>}
          {visibleColumns.trade2Make && <TableHead>Trade 2 Make</TableHead>}
          {visibleColumns.trade2Model && <TableHead>Trade 2 Model</TableHead>}
          {visibleColumns.trade2Odometer && <TableHead>Trade 2 Odometer</TableHead>}
          {visibleColumns.trade2ACV && <TableHead>Trade 2 ACV</TableHead>}
          {visibleColumns.closingManagerNumber && <TableHead>Closing Mgr #</TableHead>}
          {visibleColumns.closingManagerName && <TableHead>Closing Mgr Name</TableHead>}
          {visibleColumns.financeManagerNumber && <TableHead>Finance Mgr #</TableHead>}
          {visibleColumns.financeManagerName && <TableHead>Finance Mgr Name</TableHead>}
          {visibleColumns.salesmanNumber && <TableHead>Salesman #</TableHead>}
          {visibleColumns.salesmanName && <TableHead>Salesman Name</TableHead>}
          {visibleColumns.msrp && <TableHead>MSRP</TableHead>}
          {visibleColumns.listPrice && <TableHead>List Price</TableHead>}
          {visibleColumns.salesPrice && <TableHead>Sale Price</TableHead>}
          {visibleColumns.createdAt && <TableHead>Created At</TableHead>}
          {visibleColumns.id && <TableHead>ID</TableHead>}
          {visibleColumns.actions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>

      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id} className="hover:bg-gray-50">
            {visibleColumns.dealNumber && <TableCell>{sale.dealNumber}</TableCell>}
            {visibleColumns.customerNumber && <TableCell>{sale.customerNumber}</TableCell>}
            {visibleColumns.firstName && <TableCell>{sale.firstName}</TableCell>}
            {visibleColumns.lastName && <TableCell>{sale.lastName}</TableCell>}
            {visibleColumns.zip && <TableCell>{sale.zip}</TableCell>}
            {visibleColumns.exteriorColor && <TableCell>{sale.exteriorColor}</TableCell>}
            {visibleColumns.newUsed && <TableCell>{sale.newUsed}</TableCell>}
            {visibleColumns.stockNumber && <TableCell>{sale.stockNumber}</TableCell>}
            {visibleColumns.deliveryDate && (
              <TableCell>
                {sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString() : "Not set"}
              </TableCell>
            )}
            {visibleColumns.deliveryMileage && <TableCell>{sale.deliveryMileage}</TableCell>}
            {visibleColumns.trade1Vin && <TableCell>{sale.trade1Vin}</TableCell>}
            {visibleColumns.trade1Year && <TableCell>{sale.trade1Year}</TableCell>}
            {visibleColumns.trade1Make && <TableCell>{sale.trade1Make}</TableCell>}
            {visibleColumns.trade1Model && <TableCell>{sale.trade1Model}</TableCell>}
            {visibleColumns.trade1Odometer && <TableCell>{sale.trade1Odometer}</TableCell>}
            {visibleColumns.trade1ACV && <TableCell>{sale.trade1ACV}</TableCell>}
            {visibleColumns.trade2Vin && <TableCell>{sale.trade2Vin}</TableCell>}
            {visibleColumns.trade2Year && <TableCell>{sale.trade2Year}</TableCell>}
            {visibleColumns.trade2Make && <TableCell>{sale.trade2Make}</TableCell>}
            {visibleColumns.trade2Model && <TableCell>{sale.trade2Model}</TableCell>}
            {visibleColumns.trade2Odometer && <TableCell>{sale.trade2Odometer}</TableCell>}
            {visibleColumns.trade2ACV && <TableCell>{sale.trade2ACV}</TableCell>}
            {visibleColumns.closingManagerNumber && <TableCell>{sale.closingManagerNumber}</TableCell>}
            {visibleColumns.closingManagerName && <TableCell>{sale.closingManagerName}</TableCell>}
            {visibleColumns.financeManagerNumber && <TableCell>{sale.financeManagerNumber}</TableCell>}
            {visibleColumns.financeManagerName && <TableCell>{sale.financeManagerName}</TableCell>}
            {visibleColumns.salesmanNumber && <TableCell>{sale.salesmanNumber}</TableCell>}
            {visibleColumns.salesmanName && <TableCell>{sale.salesmanName}</TableCell>}
            {visibleColumns.msrp && <TableCell>${Number(sale.msrp).toLocaleString()}</TableCell>}
            {visibleColumns.listPrice && <TableCell>${Number(sale.listPrice).toLocaleString()}</TableCell>}
            {visibleColumns.salesPrice && <TableCell>${Number(sale.salesPrice).toLocaleString()}</TableCell>}
            {visibleColumns.createdAt && (
              <TableCell>{sale.createdAt ? new Date(sale.createdAt).toLocaleString() : ""}</TableCell>
            )}
            {visibleColumns.id && <TableCell>{sale.id}</TableCell>}
            {visibleColumns.actions && (
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                        <Eye size={16} />
                      </Button>
                    </DialogTrigger>
                    <SaleViewDialog sale={sale} />
                  </Dialog>
                  <Dialog
                    open={editingSale?.id === sale.id}
                    onOpenChange={(open) => !open && setEditingSale(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-blue-700"
                        onClick={() => setEditingSale(sale)}
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
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
</Card>

  );
}
