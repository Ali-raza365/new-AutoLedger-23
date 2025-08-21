import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Sales } from "@shared/schema";

interface SalesTableProps {
  sales: Sales[];
  isLoading: boolean;
}

function SaleViewDialog({ sale }: { sale: Sales }) {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Sale Details - {sale.dealNumber}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div><span className="text-gray-600">Customer Number:</span> <span className="font-medium">{sale.customerNumber || 'N/A'}</span></div>
              <div><span className="text-gray-600">Name:</span> <span className="font-medium">{sale.firstName} {sale.lastName}</span></div>
              <div><span className="text-gray-600">ZIP Code:</span> <span className="font-medium">{sale.zip || 'N/A'}</span></div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
            <div className="space-y-2">
              <div><span className="text-gray-600">Stock Number:</span> <span className="font-medium">{sale.stockNumber}</span></div>
              <div><span className="text-gray-600">Exterior Color:</span> <span className="font-medium">{sale.exteriorColor || 'N/A'}</span></div>
              <div><span className="text-gray-600">New/Used:</span> <span className="font-medium">{sale.newUsed}</span></div>
              <div><span className="text-gray-600">Delivery Date:</span> <span className="font-medium">{sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString() : 'Not set'}</span></div>
              <div><span className="text-gray-600">Delivery Mileage:</span> <span className="font-medium">{sale.deliveryMileage ? sale.deliveryMileage.toLocaleString() : 'N/A'} miles</span></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Trade-in Information</h3>
            <div className="space-y-2">
              {sale.trade1Vin ? (
                <>
                  <div><span className="text-gray-600">Trade 1 VIN:</span> <span className="font-mono text-sm">{sale.trade1Vin}</span></div>
                  <div><span className="text-gray-600">Trade 1 Vehicle:</span> <span className="font-medium">{sale.trade1Year} {sale.trade1Make} {sale.trade1Model}</span></div>
                  <div><span className="text-gray-600">Trade 1 Odometer:</span> <span className="font-medium">{sale.trade1Odometer ? sale.trade1Odometer.toLocaleString() : 'N/A'} miles</span></div>
                  <div><span className="text-gray-600">Trade 1 ACV:</span> <span className="font-medium">${sale.trade1ACV ? Number(sale.trade1ACV).toLocaleString() : 'N/A'}</span></div>
                </>
              ) : (
                <div className="text-gray-500">No trade-in</div>
              )}
              {sale.trade2Vin && (
                <>
                  <div><span className="text-gray-600">Trade 2 VIN:</span> <span className="font-mono text-sm">{sale.trade2Vin}</span></div>
                  <div><span className="text-gray-600">Trade 2 Vehicle:</span> <span className="font-medium">{sale.trade2Year} {sale.trade2Make} {sale.trade2Model}</span></div>
                  <div><span className="text-gray-600">Trade 2 Odometer:</span> <span className="font-medium">{sale.trade2Odometer ? sale.trade2Odometer.toLocaleString() : 'N/A'} miles</span></div>
                  <div><span className="text-gray-600">Trade 2 ACV:</span> <span className="font-medium">${sale.trade2ACV ? Number(sale.trade2ACV).toLocaleString() : 'N/A'}</span></div>
                </>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Staff Information</h3>
            <div className="space-y-2">
              <div><span className="text-gray-600">Closing Manager:</span> <span className="font-medium">{sale.closingManagerName || 'N/A'} ({sale.closingManagerNumber || 'N/A'})</span></div>
              <div><span className="text-gray-600">Finance Manager:</span> <span className="font-medium">{sale.financeManagerName || 'N/A'} ({sale.financeManagerNumber || 'N/A'})</span></div>
              <div><span className="text-gray-600">Salesman:</span> <span className="font-medium">{sale.salesmanName || 'N/A'} ({sale.salesmanNumber || 'N/A'})</span></div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Pricing Information</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><span className="text-gray-600">MSRP:</span> <span className="font-medium">${sale.msrp ? Number(sale.msrp).toLocaleString() : 'N/A'}</span></div>
            <div><span className="text-gray-600">List Price:</span> <span className="font-medium">${sale.listPrice ? Number(sale.listPrice).toLocaleString() : 'N/A'}</span></div>
            <div><span className="text-gray-600">Sales Price:</span> <span className="font-medium text-green-600">${Number(sale.salesPrice).toLocaleString()}</span></div>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Record Information</h3>
          <div><span className="text-gray-600">Created:</span> <span className="font-medium">{sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : 'N/A'}</span></div>
        </div>
      </div>
    </DialogContent>
  );
}

export default function SalesTable({ sales, isLoading }: SalesTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-blue-700"
                      onClick={() => toast({
                        title: "Edit Feature",
                        description: "Edit functionality will be available soon",
                      })}
                      data-testid={`button-edit-sale-${sale.id}`}
                    >
                      <Edit size={16} />
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
