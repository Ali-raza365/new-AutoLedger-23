import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSalesSchema, type InsertSales, type Inventory } from "@shared/schema";

interface SalesFormProps {
  onSuccess: () => void;
}

export default function SalesForm({ onSuccess }: SalesFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [vinSearch, setVinSearch] = useState("");
  const [foundVehicle, setFoundVehicle] = useState<Inventory | null>(null);

  const form = useForm<InsertSales>({
    resolver: zodResolver(insertSalesSchema),
    defaultValues: {
      dealNumber: "",
      customerNumber: "",
      firstName: "",
      lastName: "",
      zip: "",
      exteriorColor: "",
      newUsed: "",
      stockNumber: "",
      deliveryDate: undefined,
      deliveryMileage: 0,
      trade1Vin: "",
      trade1Year: undefined,
      trade1Make: "",
      trade1Model: "",
      trade1Odometer: 0,
      trade1ACV: 0,
      trade2Vin: "",
      trade2Year: undefined,
      trade2Make: "",
      trade2Model: "",
      trade2Odometer: 0,
      trade2ACV: 0,
      closingManagerNumber: "",
      closingManagerName: "",
      financeManagerNumber: "",
      financeManagerName: "",
      salesmanNumber: "",
      salesmanName: "",
      msrp: 0,
      listPrice: 0,
      salesPrice: 0,
    },
  });

  const searchVinMutation = useMutation({
    mutationFn: (vin: string) => fetch(`/api/inventory/vin/${vin}`),
    onSuccess: async (response) => {
      if (response.ok) {
        const vehicle: Inventory = await response.json();
        setFoundVehicle(vehicle);
        // Pre-fill form with vehicle data
        form.setValue("stockNumber", vehicle.stockNumber);
        form.setValue("exteriorColor", vehicle.color);
        form.setValue("listPrice", Number(vehicle.price));
        form.setValue("msrp", Number(vehicle.price) + 1000); // Estimate MSRP
        toast({
          title: "Vehicle Found",
          description: `${vehicle.year} ${vehicle.make} ${vehicle.model} - Stock #${vehicle.stockNumber}`,
        });
      } else {
        setFoundVehicle(null);
        toast({
          title: "Vehicle Not Found",
          description: "No vehicle found with this VIN in inventory",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setFoundVehicle(null);
      toast({
        title: "Search Failed",
        description: "Failed to search for vehicle",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSales) =>
      apiRequest("POST", "/api/sales", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Sale recorded successfully!",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record sale",
        variant: "destructive",
      });
    },
  });

  const handleVinSearch = () => {
    if (vinSearch.length === 17) {
      searchVinMutation.mutate(vinSearch);
    } else {
      toast({
        title: "Invalid VIN",
        description: "Please enter a valid 17-character VIN",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: InsertSales) => {
    // Clean up empty trade-in VINs
    if (!data.trade1Vin) {
      data.trade1Vin = undefined;
      data.trade1Year = undefined;
      data.trade1Make = "";
      data.trade1Model = "";
      data.trade1Odometer = 0;
      data.trade1ACV = 0;
    }
    if (!data.trade2Vin) {
      data.trade2Vin = undefined;
      data.trade2Year = undefined;
      data.trade2Make = "";
      data.trade2Model = "";
      data.trade2Odometer = 0;
      data.trade2ACV = 0;
    }
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">New Sales Entry</h3>
        <p className="text-sm text-gray-600 mt-1">Record a new vehicle sale</p>
      </div>
      
      {/* VIN Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Search Vehicle by VIN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter VIN to auto-populate vehicle details"
                maxLength={17}
                value={vinSearch}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                  setVinSearch(value);
                }}
                data-testid="input-vin-search"
              />
            </div>
            <Button 
              type="button" 
              onClick={handleVinSearch}
              disabled={searchVinMutation.isPending}
              data-testid="button-search-vin"
            >
              <Search className="mr-2" size={16} />
              {searchVinMutation.isPending ? "Searching..." : "Search"}
            </Button>
          </div>
          {foundVehicle && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 flex items-center">
                <CheckCircle className="mr-2" size={16} />
                Vehicle found: {foundVehicle.year} {foundVehicle.make} {foundVehicle.model} {foundVehicle.series} - Stock #{foundVehicle.stockNumber}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Deal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Deal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="dealNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deal Number</FormLabel>
                      <FormControl>
                        <Input placeholder="D2024001" {...field} data-testid="input-deal-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Number</FormLabel>
                      <FormControl>
                        <Input placeholder="C001234" {...field} data-testid="input-customer-number" />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-new-used">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <Input placeholder="Williams" {...field} data-testid="input-last-name" />
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
                        <Input placeholder="12345" maxLength={10} {...field} data-testid="input-zip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="stockNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Number</FormLabel>
                      <FormControl>
                        <Input className="bg-gray-100" readOnly {...field} data-testid="input-stock-number-sales" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-sales-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-delivery-date"
                        />
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
                          placeholder="12450"
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
            </CardContent>
          </Card>

          {/* Trade-In Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Trade-In Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trade 1 */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Trade Vehicle 1</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="trade1Vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={17}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                              field.onChange(value);
                            }}
                            data-testid="input-trade1-vin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                          <Input {...field} data-testid="input-trade1-make" />
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
                          <Input {...field} data-testid="input-trade1-model" />
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
                        <FormLabel>Odometer</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        <FormLabel>Actual Cash Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Trade Vehicle 2 (Optional)</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="trade2Vin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>VIN</FormLabel>
                        <FormControl>
                          <Input
                            maxLength={17}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                              field.onChange(value);
                            }}
                            data-testid="input-trade2-vin"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
                          <Input {...field} data-testid="input-trade2-make" />
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
                          <Input {...field} data-testid="input-trade2-model" />
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
                        <FormLabel>Odometer</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        <FormLabel>Actual Cash Value ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-trade2-acv"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manager Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Manager Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="closingManagerNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Manager Number</FormLabel>
                      <FormControl>
                        <Input placeholder="CM001" {...field} data-testid="input-closing-manager-number" />
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
                        <Input placeholder="Robert Johnson" {...field} data-testid="input-closing-manager-name" />
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
                      <FormLabel>Finance Manager Number</FormLabel>
                      <FormControl>
                        <Input placeholder="FM001" {...field} data-testid="input-finance-manager-number" />
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
                        <Input placeholder="Sarah Williams" {...field} data-testid="input-finance-manager-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salesmanNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salesman Number</FormLabel>
                      <FormControl>
                        <Input placeholder="SM001" {...field} data-testid="input-salesman-number" />
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
                      <FormLabel>Salesman Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Mike Johnson" {...field} data-testid="input-salesman-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-sales">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-sales">
              {createMutation.isPending ? "Recording..." : "Record Sale"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
