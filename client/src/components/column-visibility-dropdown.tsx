import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Search } from "lucide-react";

export interface ColumnDefinition {
  key: string;
  label: string;
  defaultVisible: boolean;
}

interface ColumnVisibilityDropdownProps {
  columns: ColumnDefinition[];
  visibleColumns: Record<string, boolean>;
  onVisibilityChange: (key: string, visible: boolean) => void;
  onHideAll: () => void;
  onShowAll: () => void;
  onResetToDefault: () => void;
}

export default function ColumnVisibilityDropdown({
  columns,
  visibleColumns,
  onVisibilityChange,
  onHideAll,
  onShowAll,
  onResetToDefault,
}: ColumnVisibilityDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredColumns = columns.filter((column) =>
    column.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          data-testid="button-columns"
        >
          <Eye size={16} />
          <span>Columns ({visibleCount})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 p-0"
        data-testid="dropdown-columns"
      >
        <Card className="border-0 shadow-none">
          <div className="p-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Search columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-columns"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            </div>

            {/* Preset Actions */}
            <div className="space-y-2">
               <Button
                variant="outline"
                size="sm"
                onClick={onShowAll}
                className="w-full justify-start text-sm"
                data-testid="button-hide-all"
              >
                Show All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onHideAll}
                className="w-full justify-start text-sm"
                data-testid="button-hide-all"
              >
                Hide All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetToDefault}
                className="w-full justify-start text-sm"
                data-testid="button-reset-columns"
              >
                Reset to Default
              </Button>
            </div>

            <Separator />

            {/* Column List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center space-x-2 py-1"
                  data-testid={`column-option-${column.key}`}
                >
                  <Checkbox
                    id={`column-${column.key}`}
                    checked={visibleColumns[column.key] || false}
                    onCheckedChange={(checked) =>
                      onVisibilityChange(column.key, !!checked)
                    }
                    data-testid={`checkbox-column-${column.key}`}
                  />
                  <label
                    htmlFor={`column-${column.key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {column.label}
                  </label>
                </div>
              ))}
              {filteredColumns.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No columns match "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}