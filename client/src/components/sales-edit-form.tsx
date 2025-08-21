import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesSchema, type InsertSales, type Sales, type Inventory } from "@shared/schema";

interface SalesEditFormProps {
  sale: Sales;
  onSuccess: () => void;
}

export default function SalesEditForm({ sale, onSuccess }: SalesEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertSales>({
    resolver: zodResolver(insertSalesSchema),
    defaultValues: {
      dealNumber: sale.dealNumber,
      customerNumber: sale.customerNumber || "",
      firstName: sale.firstName,
      lastName: sale.lastName,
      zip: sale.zip || "",
      exteriorColor: sale.exteriorColor || "",
      newUsed: sale.newUsed,
      stockNumber: sale.stockNumber,
      deliveryDate: sale.deliveryDate ? new Date(sale.deliveryDate).toISOString().split('T')[0] : undefined,
      deliveryMileage: sale.deliveryMileage || 0,
      trade1Vin: sale.trade1Vin || "",
      trade1Year: sale.trade1Year || undefined,
      trade1Make: sale.trade1Make || "",
      trade1Model: sale.trade1Model || "",
      trade1Odometer: sale.trade1Odometer || 0,
      trade1ACV: sale.trade1ACV || "0",
      trade2Vin: sale.trade2Vin || "",
      trade2Year: sale.trade2Year || undefined,
      trade2Make: sale.trade2Make || "",
      trade2Model: sale.trade2Model || "",
      trade2Odometer: sale.trade2Odometer || 0,
      trade2ACV: sale.trade2ACV || "0",
      closingManagerNumber: sale.closingManagerNumber || "",
      closingManagerName: sale.closingManagerName || "",
      financeManagerNumber: sale.financeManagerNumber || "",
      financeManagerName: sale.financeManagerName || "",
      salesmanNumber: sale.salesmanNumber || "",
      salesmanName: sale.salesmanName || "",
      msrp: sale.msrp || "0",
      listPrice: sale.listPrice || "0",
      salesPrice: sale.salesPrice,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertSales) => 
      apiRequest("PUT", `/api/sales/${sale.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Sales record updated successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sales record",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSales) => {
    // Clean up trade data if VINs are empty
    if (!data.trade1Vin) {
      data.trade1Vin = undefined;
      data.trade1Year = undefined;
      data.trade1Make = "";
      data.trade1Model = "";
      data.trade1Odometer = 0;
      data.trade1ACV = "0";
    }
    if (!data.trade2Vin) {
      data.trade2Vin = undefined;
      data.trade2Year = undefined;
      data.trade2Make = "";
      data.trade2Model = "";
      data.trade2Odometer = 0;
      data.trade2ACV = "0";
    }
    updateMutation.mutate(data);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <DialogHeader>
        <DialogTitle>Edit Sales Record - {sale.dealNumber}</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
          {/* Basic Sale Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sale Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dealNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deal Number</FormLabel>
                    <FormControl>
                      <Input placeholder="D2024-001" {...field} data-testid="input-deal-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="stockNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Number</FormLabel>
                    <FormControl>
                      <Input placeholder="A2024001" {...field} data-testid="input-stock-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New/Used</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-new-used">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                        <SelectItem value="Certified">Certified Pre-Owned</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customerNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Number</FormLabel>
                    <FormControl>
                      <Input placeholder="C001" {...field} data-testid="input-customer-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} data-testid="input-first-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="12345" {...field} data-testid="input-zip" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="exteriorColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exterior Color</FormLabel>
                    <FormControl>
                      <Input placeholder="Silver Metallic" {...field} data-testid="input-exterior-color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-delivery-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="deliveryMileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Mileage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15420"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-delivery-mileage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="msrp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MSRP ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="29500"
                        {...field}
                        data-testid="input-msrp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="listPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>List Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="28450"
                        {...field}
                        data-testid="input-list-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="salesPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="27200"
                        {...field}
                        data-testid="input-sales-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Staff Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Staff Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Manager Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="closingManagerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Manager #</FormLabel>
                        <FormControl>
                          <Input placeholder="M001" {...field} data-testid="input-closing-manager-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="closingManagerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Closing Manager Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Sarah Johnson" {...field} data-testid="input-closing-manager-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="financeManagerNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finance Manager #</FormLabel>
                        <FormControl>
                          <Input placeholder="F001" {...field} data-testid="input-finance-manager-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="financeManagerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Finance Manager Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mike Davis" {...field} data-testid="input-finance-manager-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Salesperson Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="salesmanNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salesperson #</FormLabel>
                        <FormControl>
                          <Input placeholder="S001" {...field} data-testid="input-salesman-number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="salesmanName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salesperson Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Robert Wilson" {...field} data-testid="input-salesman-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-edit-sales">
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-sales-changes">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}