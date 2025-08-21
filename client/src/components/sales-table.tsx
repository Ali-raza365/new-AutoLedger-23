import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Sales } from "@shared/schema";

interface SalesTableProps {
  sales: Sales[];
  isLoading: boolean;
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-blue-700"
                      data-testid={`button-view-${sale.id}`}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-blue-700"
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
