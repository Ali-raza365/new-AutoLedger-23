import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInventorySchema, type InsertInventory, type VINDecodeResult } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Settings } from "http2";
import { Check, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface InventoryFormProps {
  onSuccess: () => void;
}

export default function InventoryForm({ onSuccess }: InventoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVinLookupLoading, setIsVinLookupLoading] = useState(false);
  const [vinLookupResult, setVinLookupResult] = useState<VINDecodeResult | null>(null);
  const [showVinFields, setShowVinFields] = useState(false);
  // Fetch settings data
  const { data: settings, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("/api/settings"),
  });

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
      price: 0,
      bookValue: 0,
      cost: 0,
      markup: 0,
      odometer: 0,
      age: 0,
      specificSource: "",
      newUsed: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertInventory) =>
      apiRequest("/api/inventory", { method: "POST", body: data }),
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
    console.log(data)

    createMutation.mutate(
      { ...data, dateLogged: new Date() },
      {
        onSuccess: () => {
          refetch(); // 🔄 refetch settings after submit
        },
      }
    );
  };

  // Watch price and cost to auto-calculate markup
  const watchPrice = form.watch("price");
  const watchCost = form.watch("cost");
  const watchSource = form.watch("specificSource");

  // Auto-calculate markup when price or cost changes
  useEffect(() => {
    if (watchPrice && watchCost) {
      const calculatedMarkup = Number(watchPrice) - Number(watchCost);
      if (form.getValues("markup") !== calculatedMarkup) {
        form.setValue("markup", calculatedMarkup);
      }
    }
  }, [watchPrice, watchCost, form]);

  useEffect(() => {
    if (settings && settings.stockNumberPrefixRule && settings.stockNumberSuffixRule) {
      // Generate stock number based on rules
      const prefixRule = settings.stockNumberPrefixRule;
      const suffixRule = settings.stockNumberSuffixRule;
      const counter = settings.stockNumberSequentialCounter || 0;

      let prefix = "";
      let suffix = "";

      // Determine prefix
      if (prefixRule.type === "none") {
        prefix = "";
      } else if (prefixRule.type === "source") {
        prefix = watchSource ? watchSource.substring(0, 3).toUpperCase() : "";
      } else if (prefixRule.type === "buyer") {
        prefix = "BUY"; // Placeholder, as buyer selection is not in this form
      } else if (prefixRule.type === "custom" && prefixRule.customValue) {
        prefix = prefixRule.customValue.toUpperCase();
      }

      // Determine suffix
      if (suffixRule.type === "none") {
        suffix = "";
      } else if (suffixRule.type === "source") {
        suffix = watchSource ? watchSource.substring(0, 3).toUpperCase() : "";
      } else if (suffixRule.type === "buyer") {
        suffix = "BUY"; // Placeholder
      } else if (suffixRule.type === "custom" && suffixRule.customValue) {
        suffix = suffixRule.customValue.toUpperCase();
      }

      // Format counter with leading zeros
      const counterStr = String(counter + 1).padStart(4, "0");

      // Combine to form stock number
      const stockNumber = `${prefix}${counterStr}${suffix}`;
      form.setValue("stockNumber", stockNumber);
    }
  }, [settings, watchSource, form]);

  // VIN Lookup function
  const handleVinLookup = async () => {
    const vin = form.getValues("vin");
    if (!vin || vin.length !== 17) {
      toast({
        title: "Invalid VIN",
        description: "VIN must be exactly 17 characters",
        variant: "destructive",
      });
      return;
    }

    setIsVinLookupLoading(true);
    try {
      const year = form.getValues("year");
      const url = year ? `/api/inventory/vin-lookup/${vin}?year=${year}` : `/api/inventory/vin-lookup/${vin}`;
      const response = await apiRequest(url);

      setVinLookupResult(response.vehicleData);
      setShowVinFields(true);

      console.log(response.vehicleData)

      // Auto-populate form fields
      if (response.vehicleData.make) form.setValue("make", response.vehicleData.make);
      if (response.vehicleData.model) form.setValue("model", response.vehicleData.model);
      if (response.vehicleData.year) form.setValue("year", response.vehicleData.year);
      if (response.vehicleData.series) form.setValue("series", response.vehicleData.series || response.vehicleData.trim);
      if (response.vehicleData.trim) form.setValue("trim", response.vehicleData.trim);
      if (response.vehicleData.vehicleType) form.setValue("body", response.vehicleData.vehicleType);
      // // Map NHTSA bodyClass to our body type options
      if (response.vehicleData.bodyClass) {
        const bodyClass = response.vehicleData.bodyClass.toLowerCase();
        let mappedBody = "sedan"; // default
        if (bodyClass.includes("suv") || bodyClass.includes("utility")) mappedBody = "suv";
        else if (bodyClass.includes("truck") || bodyClass.includes("pickup")) mappedBody = "truck";
        else if (bodyClass.includes("coupe")) mappedBody = "coupe";
        else if (bodyClass.includes("convertible")) mappedBody = "convertible";
        else if (bodyClass.includes("wagon")) mappedBody = "wagon";
        else if (bodyClass.includes("hatchback")) mappedBody = "hatchback";
        form.setValue("body", mappedBody);
      }

      toast({
        title: "VIN Lookup Successful",
        description: "Vehicle details have been auto-populated from VIN",
      });
    } catch (error: any) {
      toast({
        title: "VIN Lookup Failed",
        description: error.message || "Failed to decode VIN. Please enter vehicle details manually.",
        variant: "destructive",
      });
    } finally {
      setIsVinLookupLoading(false);
    }
  };

  // Auto-lookup VIN when it changes and is 17 characters
  const watchVin = form.watch("vin");
  useEffect(() => {
    if (watchVin && watchVin.length === 17 && !isVinLookupLoading) {
      const timeoutId = setTimeout(() => {
        handleVinLookup();
      }, 1000); // Debounce for 1 second
      return () => clearTimeout(timeoutId);
    }
  }, [watchVin]);

  console.log(settings)

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
                    <Input placeholder="TC2024001" {...field}
                      readOnly
                      className="bg-gray-100"
                      data-testid="input-stock-number" />
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
                    <div className="flex gap-2">
                      <Input
                        placeholder="1HGCM82633A123456"
                        maxLength={17}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
                          field.onChange(value);
                        }}
                        data-testid="input-vin"
                        className={vinLookupResult ? "border-green-300" : ""}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleVinLookup}
                        disabled={isVinLookupLoading || !field.value || field.value.length !== 17}
                        data-testid="button-lookup-vin"
                      >
                        {isVinLookupLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  {vinLookupResult && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <Check className="w-3 h-3" />
                      <span>Vehicle details loaded from VIN</span>
                    </div>
                  )}
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
                    </SelectContent>
                  </Select>
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
                      placeholder={vinLookupResult?.year ? "Auto-filled from VIN" : "Enter vehicle year"}
                      className={vinLookupResult?.year ? "bg-green-50 border-green-300" : ""}
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
                    <Input
                      placeholder={vinLookupResult?.make ? "Auto-filled from VIN" : "Enter vehicle make"}
                      {...field}
                      data-testid="input-make"
                      className={vinLookupResult?.make ? "bg-green-50 border-green-300" : ""}
                    />
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
                    <Input
                      placeholder={vinLookupResult?.model ? "Auto-filled from VIN" : "Enter vehicle model"}
                      {...field}
                      data-testid="input-model"
                      className={vinLookupResult?.model ? "bg-green-50 border-green-300" : ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Series/Trim */}
            <FormField
              control={form.control}
              name="series"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Series/Trim</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={vinLookupResult?.series || vinLookupResult?.trim ? "Auto-filled from VIN" : "Enter series or trim"}
                      {...field}
                      data-testid="input-series"
                      className={vinLookupResult?.series || vinLookupResult?.trim ? "bg-green-50 border-green-300" : ""}
                    />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-color">
                        <SelectValue placeholder="Select Color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {settings?.colors?.map((color:any) => (
                        <SelectItem key={color.code} value={color.name}>
                          {color.name} ({color.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-body-style" className={vinLookupResult?.bodyClass ? "bg-green-50 border-green-300" : ""}>
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
                      <SelectItem value="wagon">Wagon</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Body Style */}
            <FormField
              control={form.control}
              name="specificSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-source-style" >
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {settings?.sources?.map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
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
                      value={field.value || 0}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                      value={field.value || 0}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
                      value={field.value || 0}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
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
