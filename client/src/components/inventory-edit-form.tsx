import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventorySchema, type InsertInventory, type Inventory, type VINDecodeResult } from "@shared/schema";
import { Search, Check } from "lucide-react";

interface InventoryEditFormProps {
  vehicle: Inventory;
  onSuccess: () => void;
}

export default function InventoryEditForm({ vehicle, onSuccess }: InventoryEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVinLookupLoading, setIsVinLookupLoading] = useState(false);
  const [vinLookupResult, setVinLookupResult] = useState<VINDecodeResult | null>(null);

  // Fetch settings data
  const { data: settings } = useQuery<any>({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("/api/settings"),
  });

  const form = useForm<InsertInventory>({
    resolver: zodResolver(insertInventorySchema),
    defaultValues: {
      stockNumber: vehicle.stockNumber,
      vin: vehicle.vin,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      series: vehicle.series || "",
      source: vehicle.source || "",
      seriesDetail: vehicle.seriesDetail || "",
      color: vehicle.color,
      interiorDescription: vehicle.interiorDescription || "",
      exitStrategy: vehicle.exitStrategy || "",
      certified: vehicle.certified || false,
      body: vehicle.body,
      price: vehicle.price,
      pendingPrice: vehicle.pendingPrice || null,
      bookValue: vehicle.bookValue || null,
      cost: vehicle.cost,
      applicableCost: vehicle.applicableCost || null,
      originalCost: vehicle.originalCost || null,
      costDifference: vehicle.costDifference || null,
      markup: vehicle.markup || null,
      water: vehicle.water || null,
      applicableWater: vehicle.applicableWater || null,
      overall: vehicle.overall || null,
      marketDaysSupplyLikeMine: vehicle.marketDaysSupplyLikeMine || null,
      costToMarketPct: vehicle.costToMarketPct || null,
      applicableCostToMarketPct: vehicle.applicableCostToMarketPct || null,
      marketPct: vehicle.marketPct || null,
      odometer: vehicle.odometer,
      age: vehicle.age || null,
      priceRank: vehicle.priceRank || "",
      vRank: vehicle.vRank || "",
      priceRankBucket: vehicle.priceRankBucket || "",
      vRankBucket: vehicle.vRankBucket || "",
      currentStatus: vehicle.currentStatus || "",
      statusDate: vehicle.statusDate || new Date(),
      dateLogged: vehicle.dateLogged || new Date(),
      newUsed: vehicle.newUsed || "",
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: InsertInventory) => 
      apiRequest(`/api/inventory/${vehicle.id}`, { method: "PUT", body: data }),
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
      if (form.getValues("markup") !== calculatedMarkup) {
        form.setValue("markup", calculatedMarkup);
      }
    }
  }, [watchPrice, watchCost, form]);


  return (
    <div className="max-w-6xl mx-auto">
      <DialogHeader className="pb-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Edit Vehicle
            </DialogTitle>
            <p className="text-lg text-gray-600 mt-1">{vehicle.year} {vehicle.make} {vehicle.model} • Stock #{vehicle.stockNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">${Number(vehicle.price).toLocaleString()}</p>
            <p className="text-sm text-gray-500">Current Price</p>
          </div>
        </div>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-6">
          {/* Basic Vehicle Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Basic Vehicle Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Stock Number */}
              <FormField
                control={form.control}
                name="stockNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Number</FormLabel>
                    <FormControl>
                      <Input 
                      disabled
                      placeholder="A2024001" {...field} data-testid="input-stock-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-source">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {settings?.sources?.map((source: string) => (
                          <SelectItem key={source} value={source}>
                            {source + ` (${source.substring(0, 1).toUpperCase()})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                             disabled
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
                          disabled={true}
                          data-testid="button-lookup-vin"
                        >
                       
                        </Button>
                      </div>
                    </FormControl>
                    {vinLookupResult && (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Check className="w-3 h-3" />
                        <span>Vehicle details updated from VIN</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New/Used */}
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
                        placeholder="Toyota"
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
                        placeholder="Camry"
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
                        placeholder="LE"
                        {...field}
                        data-testid="input-series"
                        className={vinLookupResult?.series || vinLookupResult?.trim ? "bg-green-50 border-green-300" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Series Detail */}
              <FormField
                control={form.control}
                name="seriesDetail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series Details</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter series details"
                        {...field}
                        data-testid="input-series-detail"
                        className={vinLookupResult?.seriesDetail ? "bg-green-50 border-green-300" : ""}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-color">
                          <SelectValue placeholder="Select Color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {settings?.colors?.map((color: any) => (
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

              {/* Interior Description */}
              <FormField
                control={form.control}
                name="interiorDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interior Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Leather, Cloth, etc." {...field} data-testid="input-interior" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Exit Strategy */}
              <FormField
                control={form.control}
                name="exitStrategy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Strategy</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-exit-strategy">
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Wholesale">Wholesale</SelectItem>
                        <SelectItem value="Auction">Auction</SelectItem>
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
                    <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value?.toString() || "false"}>
                      <FormControl>
                        <SelectTrigger data-testid="select-certified">
                          <SelectValue placeholder="Select status" />
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
              
              {/* Body */}
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-body" className={vinLookupResult?.bodyClass ? "bg-green-50 border-green-300" : ""}>
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="coupe">Coupe</SelectItem>
                        <SelectItem value="convertible">Convertible</SelectItem>
                        <SelectItem value="wagon">Wagon</SelectItem>
                        <SelectItem value="hatchback">Hatchback</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Financial Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        onChange={(e) => field.onChange(Number(e.target.value) || null)}
                        data-testid="input-cost-to-market"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Applicable % Cost To Market */}
              <FormField
                control={form.control}
                name="applicableCostToMarketPct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Applicable % Cost To Market</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter %"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value) || null)}
                        data-testid="input-applicable-cost-to-market"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* % Mkt */}
              <FormField
                control={form.control}
                name="marketPct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% Mkt</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Enter %"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value) || null)}
                        data-testid="input-market-pct"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Ranking & Performance */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Ranking & Performance</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Rank */}
              <FormField
                control={form.control}
                name="priceRank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Rank</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Price Rank" {...field} data-testid="input-price-rank" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* vRank */}
              <FormField
                control={form.control}
                name="vRank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>vRank</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vRank" {...field} data-testid="input-vrank" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price Rank Bucket */}
              <FormField
                control={form.control}
                name="priceRankBucket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Rank Bucket</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Price Rank Bucket" {...field} data-testid="input-price-rank-bucket" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* vRank Bucket */}
              <FormField
                control={form.control}
                name="vRankBucket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>vRank Bucket</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vRank Bucket" {...field} data-testid="input-vrank-bucket" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Vehicle Age */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <h3 className="text-xl font-semibold text-gray-900">Vehicle Age</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || null)}
                        data-testid="input-age"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                All changes will be saved to the inventory database
              </p>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onSuccess} 
                  data-testid="button-cancel-edit"
                  className="px-6 py-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending} 
                  data-testid="button-save-changes"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
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
