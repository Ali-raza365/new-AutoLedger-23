import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventorySchema, type InsertInventory } from "@shared/schema";

interface InventoryFormProps {
  onSuccess: () => void;
}

export default function InventoryForm({ onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      stockNumber: "",
      vin: "",
      year: new Date().getFullYear(),
      make: "",
      model: "",
      series: "",
      color: "",
      certified: false,
      body: "",
      price: "0",
      bookValue: "0",
      cost: "0",
      markup: "0",
      odometer: 0,
      age: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertInventory) =>
      apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Vehicle added to inventory successfully!",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle to inventory",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventory) => {
    // Calculate markup if price and cost are provided
    if (data.price && data.cost) {
      data.markup = String(Number(data.price) - Number(data.cost));
    }
    createMutation.mutate(data);
  };

  // Watch price and cost to auto-calculate markup
  const watchPrice = form.watch("price");
  const watchCost = form.watch("cost");

  // Auto-calculate markup when price or cost changes
  useEffect(() => {
    if (watchPrice && watchCost) {
      const calculatedMarkup = Number(watchPrice) - Number(watchCost);
      if (form.getValues("markup") !== String(calculatedMarkup)) {
        form.setValue("markup", String(calculatedMarkup));
      }
    }
  }, [watchPrice, watchCost, form]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Add New Vehicle to Inventory</h3>
        <p className="text-sm text-gray-600 mt-1">Enter vehicle details to add to inventory</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stock Number */}
            <FormField
              control={form.control}
              name="stockNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock #</FormLabel>
                  <FormControl>
                    <Input placeholder="TC2024001" {...field} data-testid="input-stock-number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* VIN */}
            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VIN</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1HGCM82633A123456"
                      maxLength={17}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                        field.onChange(value);
                      }}
                      data-testid="input-vin"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Year */}
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1900"
                      max="2030"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-year"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Make */}
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input placeholder="Toyota" {...field} data-testid="input-make" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Model */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="Camry" {...field} data-testid="input-model" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Series */}
            <FormField
              control={form.control}
              name="series"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series</FormLabel>
                  <FormControl>
                    <Input placeholder="LE" {...field} data-testid="input-series" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Color */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="Silver Metallic" {...field} data-testid="input-color" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Certified */}
            <FormField
              control={form.control}
              name="certified"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certified</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-certified">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Body Style */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Style</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-body-style">
                        <SelectValue placeholder="Select Body Style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="convertible">Convertible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="28450"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value || "0")}
                      data-testid="input-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Book Value */}
            <FormField
              control={form.control}
              name="bookValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book Value ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="26500"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value || "0")}
                      data-testid="input-book-value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Cost */}
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="24000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value || "0")}
                      data-testid="input-cost"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Markup (calculated) */}
            <FormField
              control={form.control}
              name="markup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Markup ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      readOnly
                      className="bg-gray-100"
                      data-testid="input-markup"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Odometer */}
            <FormField
              control={form.control}
              name="odometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer (miles)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="12450"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-odometer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Age */}
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="45"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-age"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-inventory">
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-inventory">
              {createMutation.isPending ? "Adding..." : "Add Vehicle"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
