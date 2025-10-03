import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Download, Search } from "lucide-react";
import type { Sales } from "@shared/schema";
import SalesForm from "@/components/sales-form";
import SalesTable from "@/components/sales-table";
import ColumnVisibilityDropdown, { type ColumnDefinition } from "@/components/column-visibility-dropdown";
import { buildCsv, downloadCsv, generateExportFilename, formatCsvDate } from "@/lib/csvUtils";
import { toast } from "@/hooks/use-toast";

const SALES_COLUMNS: ColumnDefinition[] = [
  { key: "dealNumber", label: "Deal #", defaultVisible: true },
  { key: "customerNumber", label: "Customer #", defaultVisible: false },
  { key: "firstName", label: "First Name", defaultVisible: true },
  { key: "lastName", label: "Last Name", defaultVisible: true },
  { key: "zip", label: "ZIP", defaultVisible: false },
  { key: "exteriorColor", label: "Exterior Color", defaultVisible: false },
  { key: "newUsed", label: "New/Used", defaultVisible: false },
  { key: "stockNumber", label: "Stock #", defaultVisible: true },
  { key: "vehicle", label: "Vehicle", defaultVisible: true }, // optional composite if you want
  { key: "deliveryDate", label: "Delivery Date", defaultVisible: true },
  { key: "deliveryMileage", label: "Delivery Mileage", defaultVisible: false },

  // Trade 1 fields
  { key: "trade1Vin", label: "Trade 1 VIN", defaultVisible: false },
  { key: "trade1Year", label: "Trade 1 Year", defaultVisible: false },
  { key: "trade1Make", label: "Trade 1 Make", defaultVisible: false },
  { key: "trade1Model", label: "Trade 1 Model", defaultVisible: false },
  { key: "trade1Odometer", label: "Trade 1 Odometer", defaultVisible: false },
  { key: "trade1ACV", label: "Trade 1 ACV", defaultVisible: false },

  // Trade 2 fields
  { key: "trade2Vin", label: "Trade 2 VIN", defaultVisible: false },
  { key: "trade2Year", label: "Trade 2 Year", defaultVisible: false },
  { key: "trade2Make", label: "Trade 2 Make", defaultVisible: false },
  { key: "trade2Model", label: "Trade 2 Model", defaultVisible: false },
  { key: "trade2Odometer", label: "Trade 2 Odometer", defaultVisible: false },
  { key: "trade2ACV", label: "Trade 2 ACV", defaultVisible: false },

  // Management fields
  { key: "closingManagerNumber", label: "Closing Manager #", defaultVisible: false },
  { key: "closingManagerName", label: "Closing Manager Name", defaultVisible: false },
  { key: "financeManagerNumber", label: "Finance Manager #", defaultVisible: false },
  { key: "financeManagerName", label: "Finance Manager Name", defaultVisible: false },
  { key: "salesmanNumber", label: "Salesman #", defaultVisible: false },
  { key: "salesmanName", label: "Salesman Name", defaultVisible: true },

  // Pricing fields
  { key: "msrp", label: "MSRP", defaultVisible: false },
  { key: "listPrice", label: "List Price", defaultVisible: false },
  { key: "salesPrice", label: "Sale Price", defaultVisible: true },

  // Metadata
  { key: "createdAt", label: "Created At", defaultVisible: false },
  { key: "id", label: "ID", defaultVisible: false },

  // Actions
  { key: "actions", label: "Actions", defaultVisible: true },
];


export default function Sales() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);


  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    SALES_COLUMNS.forEach(col => {
      initial[col.key] = col.defaultVisible;
    });
    return initial;
  });

  const handleVisibilityChange = (key: string, visible: boolean) => {
    setVisibleColumns(prev => ({ ...prev, [key]: visible }));
  };

  const handleHideAll = () => {
    const hidden: Record<string, boolean> = {};
    SALES_COLUMNS.forEach(col => {
      hidden[col.key] = false;
    });
    setVisibleColumns(hidden);
  };

  const handleShowAll = () => {
    const shown: Record<string, boolean> = {};
    SALES_COLUMNS.forEach(col => {
      shown[col.key] = true;
    });
    setVisibleColumns(shown);
  };

  const handleResetToDefault = () => {
    const defaults: Record<string, boolean> = {};
    SALES_COLUMNS.forEach(col => {
      defaults[col.key] = col.defaultVisible;
    });
    setVisibleColumns(defaults);
  };

  const { data: sales = [], isLoading } = useQuery<Sales[]>({
    queryKey: ["/api/sales"],
  });

  console.log({ sales })

  const filteredSales = sales.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.dealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.customerNumber && item.customerNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Export sales data to CSV
  const exportToCSV = () => {
    if (filteredSales.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No sales records available for export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const headers = SALES_COLUMNS.map(column => column.label);



      const csvData = filteredSales.map((item: any) => {
        return SALES_COLUMNS.map(column => {
          const key = column.key;
          let value = item[key];

          // Handle specific fields
          if (key === "vehicle") {
            // You'll need to know what to compose the vehicle string from.
            // This is a common pattern for "vehicle" fields.
            value = `${item.year ?? ""} ${item.make ?? ""} ${item.model ?? ""}`;
          } else if (key === "deliveryDate" || key === "createdAt") {
            // Check if the value is a valid Date object before formatting
            value = item[key] instanceof Date ? formatCsvDate(item[key]) : "";
          } else if (value === null || value === undefined) {
            value = "";
          }

          return value;
        });
      });

      const csvContent = buildCsv(headers, csvData);
      const filename = generateExportFilename("sales");

      downloadCsv(csvContent, filename);

      toast({
        title: "Export Successful",
        description: `Exported ${filteredSales.length} sales records to ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting sales data.",
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
            <h2 className="text-2xl font-semibold text-gray-900">Sales Log</h2>
            <p className="text-sm text-gray-600 mt-1">Track vehicle sales and customer information</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-6">
          {/* Sales Header Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-4 lg:mb-0">
              <div className="flex items-center space-x-4">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-sale">
                      <Plus className="mr-2" size={16} />
                      New Sale
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogTitle className="sr-only">Record New Sale</DialogTitle>
                    <DialogDescription className="sr-only">Enter sale details and customer information</DialogDescription>
                    <SalesForm onSuccess={() => setIsFormOpen(false)} />
                  </DialogContent>
                </Dialog>
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
                  placeholder="Search by deal number, customer..."
                  className="pl-10 w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-sales"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              </div>
              <ColumnVisibilityDropdown
                columns={SALES_COLUMNS}
                visibleColumns={visibleColumns}
                onVisibilityChange={handleVisibilityChange}
                onHideAll={handleHideAll}
                onShowAll={handleShowAll}
                onResetToDefault={handleResetToDefault}
              />
            </div>
          </div>

          {/* Sales Table */}
          <SalesTable
            sales={filteredSales}
            isLoading={isLoading}
            visibleColumns={visibleColumns}
          />
        </div>
      </main>
    </>
  );
}
