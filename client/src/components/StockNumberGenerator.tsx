import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Save, Pencil, Hash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Settings, StockNumberRule } from "@shared/schema";

interface StockNumberCardProps {
  type: 'used' | 'new';
  settings: Settings;
}

export function StockNumberCard({ type, settings }: StockNumberCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValues, setTempValues] = useState<{
    prefixRule: StockNumberRule;
    suffixRule: StockNumberRule;
    counter: number;
  } | null>(null);

  const prefix = type === 'new' ? 'newStockNumber' : 'usedStockNumber';

  // Get current values from settings
  const currentPrefixRule = settings[`${prefix}PrefixRule` as keyof Settings] as StockNumberRule || { type: "none" };
  const currentSuffixRule = settings[`${prefix}SuffixRule` as keyof Settings] as StockNumberRule || { type: "none" };
  const currentCounter = (settings[`${prefix}SequentialCounter` as keyof Settings] as number) || (type === 'used' ? 1004 : 2000);

  // Get values to display (either temp editing values or current values)
  const displayPrefixRule = isEditing ? tempValues!.prefixRule : currentPrefixRule;
  const displaySuffixRule = isEditing ? tempValues!.suffixRule : currentSuffixRule;
  const displayCounter = isEditing ? tempValues!.counter : currentCounter;

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) =>
      apiRequest("/api/settings", { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: `${type === 'new' ? 'New' : 'Used'} vehicle stock number settings saved successfully.`,
      });
      setIsEditing(false);
      setTempValues(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setIsEditing(true);
    setTempValues({
      prefixRule: currentPrefixRule,
      suffixRule: currentSuffixRule,
      counter: currentCounter,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempValues(null);
  };

  const handleSave = () => {
    if (!tempValues) return;

    const updatedSettings = {
      ...settings,
      [`${prefix}PrefixRule`]: tempValues.prefixRule,
      [`${prefix}SuffixRule`]: tempValues.suffixRule,
      [`${prefix}SequentialCounter`]: Number(tempValues.counter),
    };

    console.log({ updatedSettings })

    updateMutation.mutate(updatedSettings);
  };

  const handleRuleChange = (ruleType: 'prefix' | 'suffix', value: string) => {
    if (!tempValues) return;

    const newRule: StockNumberRule = value === 'custom'
      ? { type: 'custom', customValue: '' }
      : { type: value as any };

    setTempValues({
      ...tempValues,
      [ruleType === 'prefix' ? 'prefixRule' : 'suffixRule']: newRule,
    });
  };

  const handleCustomValueChange = (ruleType: 'prefix' | 'suffix', value: string) => {
    if (!tempValues) return;

    const key = ruleType === 'prefix' ? 'prefixRule' : 'suffixRule';
    setTempValues({
      ...tempValues,
      [key]: { type: 'custom', customValue: value },
    });
  };

  const handleCounterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tempValues) return;
    const value = e.target.value;

    if (/^\d*$/.test(value)) {
      setTempValues({
        ...tempValues,
        counter: value === '' ? 0 : Number(value),
      });
    }
  };

  const generatePreview = (): string => {
    let prefixStr = "";
    let suffixStr = "";

    // Generate prefix
    if (displayPrefixRule.type === "source" && settings.sources?.[0]) {
      prefixStr = settings.sources[0].substring(0, 1).toUpperCase();
    } else if (displayPrefixRule.type === "buyer") {
      prefixStr = 'BUY';
    } else if (displayPrefixRule.type === "custom" && 'customValue' in displayPrefixRule && displayPrefixRule.customValue) {
      prefixStr = displayPrefixRule.customValue.toUpperCase();
    }

    // Generate suffix
    if (displaySuffixRule.type === "source" && settings.sources?.[0]) {
      suffixStr = settings.sources[0].substring(0, 1).toUpperCase();
    } else if (displaySuffixRule.type === "buyer") {
      suffixStr = 'BUY';
    } else if (displaySuffixRule.type === "custom" && 'customValue' in displaySuffixRule && displaySuffixRule.customValue) {
      suffixStr = displaySuffixRule.customValue.toUpperCase();
    }

    const counterStr = String(displayCounter).padStart(4, "0");
    return `${prefixStr}${counterStr}${suffixStr}`;
  };

  return (
    <Card className="mt-8 mb-8 group hover:shadow-xl border-2 transition-all duration-300 hover:-translate-y-1  shadow-lg  backdrop-blur-sm">
      <CardHeader className="border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${type === 'used' ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Hash className={`w-5 h-5 ${type === 'used' ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <div>
              <CardTitle className="text-xl">
                {type === 'used' ? 'Used' : 'New'} Vehicle Stock Number
              </CardTitle>
              <CardDescription>
                Configure how stock numbers are built for {type} vehicles
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="hover:bg-gray-100"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {!isEditing ? (
          <>
            {/* View Mode */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Prefix Rule
                </Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="text-base font-medium capitalize">
                    {displayPrefixRule.type}
                  </span>
                  {'customValue' in displayPrefixRule && displayPrefixRule.customValue && (
                    <span className="text-sm text-gray-600 ml-2">
                      ({displayPrefixRule.customValue})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Suffix Rule
                </Label>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <span className="text-base font-medium capitalize">
                    {displaySuffixRule.type}
                  </span>
                  {'customValue' in displaySuffixRule && displaySuffixRule.customValue && (
                    <span className="text-sm text-gray-600 ml-2">
                      ({displaySuffixRule.customValue})
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Current Preview
                </Label>
                <div className={`p-4 rounded-lg border-2 ${type === 'used' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                  <span className={`text-xl font-bold ${type === 'used' ? 'text-blue-700' : 'text-green-700'}`}>
                    {generatePreview()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-semibold text-gray-700">Sequential Number</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Automatically increments each time a stock is created
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-600">Current counter:</span>
                <span className="text-2xl font-bold text-gray-900">{displayCounter}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Edit Mode */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Prefix Rule
                </Label>
                <Select
                  value={displayPrefixRule.type}
                  onValueChange={(value) => handleRuleChange('prefix', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="source">Source</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="custom">Custom (fixed value)</SelectItem>
                  </SelectContent>
                </Select>
                {displayPrefixRule.type === 'custom' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom prefix"
                    value={'customValue' in displayPrefixRule ? displayPrefixRule.customValue : ''}
                    onChange={(e) => handleCustomValueChange('prefix', e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Suffix Rule
                </Label>
                <Select
                  value={displaySuffixRule.type}
                  onValueChange={(value) => handleRuleChange('suffix', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="source">Source</SelectItem>
                    <SelectItem value="buyer">Buyer</SelectItem>
                    <SelectItem value="custom">Custom (fixed value)</SelectItem>
                  </SelectContent>
                </Select>
                {displaySuffixRule.type === 'custom' && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom suffix"
                    value={'customValue' in displaySuffixRule ? displaySuffixRule.customValue : ''}
                    onChange={(e) => handleCustomValueChange('suffix', e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Sequential Number
              </Label>
              <Input
                type="text"
                value={displayCounter}
                onChange={handleCounterChange}
                className="max-w-xs"
              />
              <p className="text-sm text-gray-600 mt-1">
                The number will auto-increment from this value.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Preview
              </Label>
              <div className={`p-4 rounded-lg border-2 ${type === 'used' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                <span className={`text-2xl font-bold ${type === 'used' ? 'text-blue-700' : 'text-green-700'}`}>
                  {generatePreview()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Auto-updates as you change settings
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}