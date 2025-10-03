import { useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Download, Search, Upload } from "lucide-react";
import type { Inventory } from "@shared/schema";
import InventoryForm from "@/components/inventory-form";
import InventoryTable from "@/components/inventory-table";
import ColumnVisibilityDropdown, { type ColumnDefinition } from "@/components/column-visibility-dropdown";
import { buildCsv, downloadCsv, generateExportFilename, formatCsvDate, parseCsv, parseFile } from "@/lib/csvUtils";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const INVENTORY_COLUMNS: ColumnDefinition[] = [
  { key: "stockNumber", label: "Stock #", defaultVisible: true },
  { key: "vin", label: "VIN", defaultVisible: true },
  { key: "year", label: "Year", defaultVisible: true },
  { key: "make", label: "Make", defaultVisible: true },
  { key: "model", label: "Model", defaultVisible: true },
  { key: "series", label: "Series", defaultVisible: false },
  { key: "seriesDetail", label: "Series Detail", defaultVisible: false },
  { key: "color", label: "Color", defaultVisible: true },
  { key: "interiorDescription", label: "Interior Description", defaultVisible: false },
  { key: "exitStrategy", label: "Exit Strategy", defaultVisible: false },
  { key: "certified", label: "Certified", defaultVisible: false },
  { key: "newUsed", label: "Vehicle Type", defaultVisible: false },
  { key: "body", label: "Body", defaultVisible: false },
  { key: "price", label: "Price", defaultVisible: true },
  { key: "pendingPrice", label: "Pending Price", defaultVisible: false },
  { key: "bookValue", label: "Book Value", defaultVisible: false },
  { key: "cost", label: "Cost", defaultVisible: false },
  { key: "applicableCost", label: "Applicable Cost", defaultVisible: false },
  { key: "originalCost", label: "Original Cost", defaultVisible: false },
  { key: "costDifference", label: "Cost Difference", defaultVisible: false },
  { key: "markup", label: "Markup", defaultVisible: false },
  { key: "water", label: "Water", defaultVisible: false },
  { key: "applicableWater", label: "Applicable Water", defaultVisible: false },
  { key: "overall", label: "Overall", defaultVisible: false },
  { key: "marketDaysSupplyLikeMine", label: "Market Days Supply Like Mine", defaultVisible: false },
  { key: "costToMarketPct", label: "% Cost To Market", defaultVisible: false },
  { key: "applicableCostToMarketPct", label: "Applicable % Cost To Market", defaultVisible: false },
  { key: "marketPct", label: "% Mkt", defaultVisible: false },
  { key: "odometer", label: "Odometer", defaultVisible: true },
  { key: "age", label: "Age", defaultVisible: true },
  { key: "priceRank", label: "Price Rank", defaultVisible: false },
  { key: "vRank", label: "vRank", defaultVisible: false },
  { key: "priceRankBucket", label: "Price Rank Bucket", defaultVisible: false },
  { key: "vRankBucket", label: "vRank Bucket", defaultVisible: false },
  { key: "currentStatus", label: "Current Status", defaultVisible: false },
  { key: "statusDate", label: "Status Date", defaultVisible: false },
  // Metadata
  // { key: "dateLogged", label: "Date Logged", defaultVisible: false },
  { key: "createdAt", label: "Created At", defaultVisible: false },
  { key: "actions", label: "Actions", defaultVisible: true },

];




export default function Inventory() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      initial[col.key] = col.defaultVisible;
    });
    return initial;
  });

  console.log(visibleColumns)
  const handleVisibilityChange = (key: string, visible: boolean) => {
    setVisibleColumns(prev => ({ ...prev, [key]: visible }));
  };

  const handleHideAll = () => {
    const hidden: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      hidden[col.key] = false;
    });
    setVisibleColumns(hidden);
  };

  const handleShowAll = () => {
    const shown: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      shown[col.key] = true;
    });
    setVisibleColumns(shown);
  };

  const handleResetToDefault = () => {
    const defaults: Record<string, boolean> = {};
    INVENTORY_COLUMNS.forEach(col => {
      defaults[col.key] = col.defaultVisible;
    });
    setVisibleColumns(defaults);
  };

  const { data: inventory = [], isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stockNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMake =
      !selectedMake || selectedMake === "all" || item.make === selectedMake;

    const matchesVehicleType =
      !selectedVehicleType || selectedVehicleType === "all" || item.newUsed === selectedVehicleType;

    return matchesSearch && matchesMake && matchesVehicleType;
  });

  const uniqueMakes = Array.from(new Set(inventory.map(item => item.make))).sort();

  // Unique vehicle types ("New", "Used")
  const uniqueVehicleTypes = Array.from(
    new Set(["New", "Used"])
  );



  const importMutation = useMutation({
    mutationFn: (items: any[]) =>
      apiRequest("/api/inventory/bulk-import", {
        method: "POST",
        body: { items },
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });

      // ✅ Success summary toast
      toast({
        title: "Import Completed",
        description: `Successfully imported ${data.successCount} items. ${data.failedCount} failed.`,
        variant: data.failedCount > 0 ? "default" : "default",
      });

      // ✅ If failed, show details
      if (data.failedCount > 0) {
        console.error("Failed imports:", data);

        // Grab first few errors for preview
        const errorPreview = data.failed
          .slice(0, 3) // only show first 3 errors in toast
          .map((f: any) => `Row ${f.row}: ${f.error}`)
          .join("\n");

        setTimeout(() => {
          toast({
            title: "Import Errors",
            description:
              errorPreview +
              (data.failedCount > 3
                ? `\n...and ${data.failedCount - 3} more`
                : ""),
            variant: "default",
          });
        }, 1000);
      }
    },
    onError: (error: Error) => {
      console.log({...error})
      toast({
        title: "Import Failed",
        description: error.message || "An error occurred while importing data.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsImporting(false);
    },
  });


  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);

      const parsedData = await parseFile(file);

      if (parsedData.length === 0) {
        toast({
          title: "Empty File",
          description: "The file is empty or invalid.",
          variant: "destructive",
        });
        return;
      }

      importMutation.mutate(parsedData);
    } catch (err) {
      toast({
        title: "Parse Error",
        description: "Failed to parse the file. Please check format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };



  // Export inventory data to CSV
  const exportToCSV = async () => {
    if (filteredInventory.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No inventory records available for export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Only include columns that are visible
      const visibleCols = INVENTORY_COLUMNS.filter(col => visibleColumns[col.key]);

      // Build headers only from visible columns
      const headers = visibleCols.map(column => column.label);

      // Dynamically map data based on visible column keys
      const csvData = filteredInventory.map((item: any) => {
        return visibleCols.map(column => {
          const key = column.key;
          let value = item[key];

          // Handle special formatting
          if (key === "vehicle") {
            value = `${item.year} ${item.make} ${item.model}`;
          } else if (key === "certified") {
            value = item.certified ? "Yes" : "No";
          } else if (key === "dateLogged") {
            value = formatCsvDate(item.dateLogged);
          } else if (key === "statusDate" || key === "createdAt") {
            value = item[key] ? new Date(item[key]).toLocaleDateString() : "";
          } else if (value === null || value === undefined) {
            value = "";
          }

          return value;
        });
      });

      const csvContent = buildCsv(headers, csvData);
      const filename = generateExportFilename("inventory");

      await downloadCsv(csvContent, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredInventory.length} inventory records to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting inventory data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Car Inventory</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your vehicle inventory</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {/* Inventory Header Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-4">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-vehicle">
                      <Plus className="mr-2" size={16} />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Add New Vehicle to Inventory</DialogTitle>
                    <DialogDescription className="sr-only">Enter vehicle details to add to inventory</DialogDescription>
                    <InventoryForm onSuccess={() => setIsFormOpen(false)} />
                  </DialogContent>
                </Dialog>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                  data-testid="input-import-file"
                />

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  data-testid="button-import"
                >
                  <Upload className="mr-2" size={16} />
                  {isImporting ? "Importing..." : "Import"}
                </Button>
                <Button variant="outline" onClick={exportToCSV} disabled={isExporting} data-testid="button-export">
                  <Download className="mr-2" size={16} />
                  Export
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by Stock, VIN, Make, Model..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-inventory"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <SelectTrigger className="w-40" data-testid="select-vehicleType-filter">
                  <SelectValue placeholder="All Vehicle Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicle Types</SelectItem>
                  {uniqueVehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMake} onValueChange={setSelectedMake}>
                <SelectTrigger className="w-40" data-testid="select-make-filter">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>{make}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <ColumnVisibilityDropdown
                columns={INVENTORY_COLUMNS}
                visibleColumns={visibleColumns}
                onVisibilityChange={handleVisibilityChange}
                onHideAll={handleHideAll}
                onShowAll={handleShowAll}
                onResetToDefault={handleResetToDefault}
              />
            </div>
          </div>

          {/* Inventory Table */}
          <InventoryTable
            inventory={filteredInventory}
            isLoading={isLoading}
            visibleColumns={visibleColumns}
          />
        </div>
      </main>
    </>
  );
}
