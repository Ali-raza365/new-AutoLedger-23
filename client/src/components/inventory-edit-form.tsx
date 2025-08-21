import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventorySchema, type InsertInventory, type Inventory } from "@shared/schema";

interface InventoryEditFormProps {
  vehicle: Inventory;
  onSuccess: () => void;
}

export default function InventoryEditForm({ vehicle, onSuccess }: InventoryEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      stockNumber: vehicle.stockNumber,
      vin: vehicle.vin,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      series: vehicle.series || "",
      color: vehicle.color,
      certified: vehicle.certified || false,
      body: vehicle.body,
      price: vehicle.price,
      bookValue: vehicle.bookValue || "0",
      cost: vehicle.cost,
      markup: vehicle.markup || "0",
      odometer: vehicle.odometer,
      age: vehicle.age || 0,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertInventory) => 
      apiRequest("PUT", `/api/inventory/${vehicle.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertInventory) => {
    updateMutation.mutate(data);
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
    <div className="max-w-4xl mx-auto">
      <DialogHeader>
        <DialogTitle>Edit Vehicle - {vehicle.stockNumber}</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Stock Number */}
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
                  <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString() || "false"}>
                    <FormControl>
                      <SelectTrigger data-testid="select-certified">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Body */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-body">
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Truck">Truck</SelectItem>
                      <SelectItem value="Coupe">Coupe</SelectItem>
                      <SelectItem value="Convertible">Convertible</SelectItem>
                      <SelectItem value="Wagon">Wagon</SelectItem>
                      <SelectItem value="Hatchback">Hatchback</SelectItem>
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
            <Button type="button" variant="outline" onClick={onSuccess} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-changes">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}