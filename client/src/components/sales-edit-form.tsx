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
    <div className="max-w-7xl mx-auto">
      <DialogHeader className="pb-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Sale Record
            </DialogTitle>
            <p className="text-lg text-gray-600 mt-1">Deal #{sale.dealNumber} • {sale.firstName} {sale.lastName} • Stock #{sale.stockNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">${Number(sale.salesPrice).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Sale Price</p>
          </div>
        </div>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
          {/* Basic Sale Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Sale Information</h3>
            </div>
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Vehicle Details</h3>
            </div>
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Pricing Information</h3>
            </div>
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Staff Information</h3>
            </div>
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
          
          {/* Trade-in Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Trade-in Vehicles</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Trade 1 */}
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-700 mb-3">Trade-in #1</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="trade1Vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1HGCM82633A123456"
                              maxLength={17}
                              {...field}
                              className="font-mono"
                              data-testid="input-trade1-vin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="trade1Year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2030"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-trade1-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade1Make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Honda" {...field} data-testid="input-trade1-make" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade1Model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Civic" {...field} data-testid="input-trade1-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade1Odometer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="85000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-trade1-odometer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade1ACV"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ACV ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="8500"
                            {...field}
                            className="font-semibold text-yellow-600"
                            data-testid="input-trade1-acv"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Trade 2 */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-amber-700 mb-3">Trade-in #2 (Optional)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="trade2Vin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>VIN</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1HGCM82633A123456"
                              maxLength={17}
                              {...field}
                              className="font-mono"
                              data-testid="input-trade2-vin"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="trade2Year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1900"
                            max="2030"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            data-testid="input-trade2-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade2Make"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Make</FormLabel>
                        <FormControl>
                          <Input placeholder="Honda" {...field} data-testid="input-trade2-make" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade2Model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="Civic" {...field} data-testid="input-trade2-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade2Odometer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mileage</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="85000"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-trade2-odometer"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trade2ACV"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ACV ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="8500"
                            {...field}
                            className="font-semibold text-amber-600"
                            data-testid="input-trade2-acv"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                All changes will be saved to the sales database
              </p>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onSuccess} 
                  data-testid="button-cancel-edit-sales"
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending} 
                  data-testid="button-save-sales-changes"
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}