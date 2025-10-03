import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { apiRequest } from "@/lib/queryClient";

interface CsvUploadProps {
    type: "sources" | "lenders" | "colors" | "users" | "status";
    onSuccess: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg";
}

export function CsvUpload({
    type,
    onSuccess,
    variant = "outline",
    size = "sm",
}: CsvUploadProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Ensure only CSV
        if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
            toast({
                title: "Invalid File",
                description: "Please upload a CSV file only.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results: any) => {
                try {
                    if (!results.data || results.data.length === 0) {
                        throw new Error("CSV file is empty or invalid.");
                    }

                    let data: any[] = [];

                    switch (type) {
                        case "colors":
                            data = results.data
                                .map((row: any) => ({
                                    code: row.code || row.Code || row.CODE || "",
                                    name: row.name || row.Name || row.NAME || "",
                                }))
                                .filter((r: any) => r.code && r.name);
                            break;

                        case "users":
                            data = results.data
                                .map((row: any) => ({
                                    code: row.code || row.Code || "",
                                    name: row.name || row.Name || "",
                                    roles: (row.roles || row.Roles || "")
                                        .split(",")
                                        .map((r: string) => r.trim())
                                        .filter(Boolean),
                                }))
                                .filter((r: any) => r.code && r.name && r.roles.length > 0);
                            break;

                        case "sources":
                        case "lenders":
                        case "status": {
                            const firstKey = Object.keys(results.data[0] || {})[0];
                            data = results.data
                                .map((row: any) => {
                                    return (
                                        row.name ||
                                        row.Name ||
                                        row[type] ||
                                        row[type.charAt(0).toUpperCase() + type.slice(1)] ||
                                        row[firstKey] ||
                                        ""
                                    );
                                })
                                .filter((val: string) => val.trim() !== "");
                            break;
                        }

                        default:
                            break;
                    }

                    if (data.length === 0) {
                        throw new Error("No valid rows found in CSV.");
                    }

                    const endpoint = `/api/settings/import/${type}`;
                    await apiRequest(endpoint, {
                        method: "POST",
                        body: { data },
                    });

                    toast({
                        title: "Success",
                        description: `${type.charAt(0).toUpperCase() + type.slice(1)} imported successfully (${data.length} records).`,
                    });

                    onSuccess();

                    // Reset file input
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                } catch (error: any) {
                    toast({
                        title: "Import Failed",
                        description: error.message || "Failed to import data",
                        variant: "destructive",
                    });
                } finally {
                    setIsUploading(false);
                }
            },
            error: (error: any) => {
                toast({
                    title: "Parse Error",
                    description: error.message || "Failed to parse CSV file",
                    variant: "destructive",
                });
                setIsUploading(false);
            },
        });
    };

    const getInstructions = () => {
        switch (type) {
            case "sources":
                return "CSV should have a column named 'name' or 'source' (one per row)";
            case "lenders":
                return "CSV should have a column named 'name' or 'lender' (one per row)";
            case "colors":
                return "CSV should have columns 'code' and 'name'";
            case "users":
                return "CSV should have columns 'code', 'name', and 'roles' (comma-separated)";
            case "status":
                return "CSV should have a column named 'name' or 'status'";
            default:
                return "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="hidden"
                data-testid={`csv-upload-input-${type}`}
            />
            <Button
                variant={variant}
                size={size}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="border-blue-200 hover:border-blue-300"
                data-testid={`csv-upload-button-${type}`}
            >
                {isUploading ? (
                    <>
                        <FileSpreadsheet className="w-4 h-4 mr-2 animate-pulse" />
                        Uploading...
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4 mr-2 text-blue-600" />
                        Upload CSV
                    </>
                )}
            </Button>
            <p className="text-xs text-gray-500 flex items-start gap-1">
                <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>{getInstructions()}</span>
            </p>
        </div>
    );
}
