import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Plus, X, Save, Edit, Pencil, Hash } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ColorOptionType, Settings, StockNumberRule, UserOptionType } from "@shared/schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CsvUpload } from "@/components/csv-upload";
import { StockNumberCard } from "@/components/StockNumberGenerator";
const rolesList = [
  { id: "sales", name: "Salesperson" },
  { id: "closer", name: "Closer" },
  { id: "manager", name: "Manager" },
  { id: "finance", name: "Finance" },
  { id: "source", name: "Source" },
];

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});

  // Fetch settings data
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    queryFn: () => apiRequest("/api/settings"),
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Settings>) =>
      apiRequest("/api/settings", { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
      setEditMode(null);
      setTempValues({});
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (section: string) => {
    if (!settings) return;
    setEditMode(section);
    setTempValues({ [section]: [...(settings[section as keyof Settings] as any[])] });
  };

  const handleCancel = () => {
    setEditMode(null);
    setTempValues({});
  };

  const handleSave = (section: string) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      [section]: tempValues[section]
    };

    console.log({ updatedSettings })

    updateMutation.mutate(updatedSettings);
  };

  const handleAddItem = (section: string) => {
    const currentValues = tempValues[section] || [];

    if (section === "model") {
      setTempValues({
        ...tempValues,
        [section]: [...currentValues, { name: "", Series: [] }]
      });
    } else if (section === "colors") {
      setTempValues({
        ...tempValues,
        [section]: [...currentValues, { code: "", name: "" }]
      });
    } else if (section === "users") {
      setTempValues({
        ...tempValues,
        [section]: [...currentValues, { code: "", name: "" }]
      });

    } else {
      setTempValues({
        ...tempValues,
        [section]: [...currentValues, ""]
      });
    }
  };

  const handleRemoveItem = (section: string, index: number) => {
    const currentValues = [...tempValues[section]];
    currentValues.splice(index, 1);
    setTempValues({
      ...tempValues,
      [section]: currentValues
    });
  };

  const handleItemChange = (section: string, index: number, value: any, field?: string) => {
    const currentValues = [...tempValues[section]];

    if (field) {
      currentValues[index] = { ...currentValues[index], [field]: value };
    } else {
      currentValues[index] = value;
    }

    setTempValues({
      ...tempValues,
      [section]: currentValues
    });
  };


// Stock Number Generation helper functions for USED vehicles
  const handleStockNumberEdit = (type: 'used' | 'new') => {
    if (!settings) return;
    setEditMode(`stockNumber-${type}`);
    
    if (type === 'used') {
      setTempValues({
        usedStockNumberPrefixRule: settings.usedStockNumberPrefixRule || { type: "none" },
        usedStockNumberSequentialCounter: Number(settings.usedStockNumberSequentialCounter || 1004),
        usedStockNumberSuffixRule: settings.usedStockNumberSuffixRule || { type: "none" },
      });
    } else {
      setTempValues({
        newStockNumberPrefixRule: settings.newStockNumberPrefixRule || { type: "none" },
        newStockNumberSequentialCounter: Number(settings.newStockNumberSequentialCounter || 2000),
        newStockNumberSuffixRule: settings.newStockNumberSuffixRule || { type: "none" },
      });
    }
  };

  const handleStockNumberSave = (type: 'used' | 'new') => {
    if (!settings) return;

    const updatedSettings = type === 'used' ? {
      ...settings,
      usedStockNumberPrefixRule: tempValues.usedStockNumberPrefixRule,
      usedStockNumberSuffixRule: tempValues.usedStockNumberSuffixRule,
      usedStockNumberSequentialCounter: Number(tempValues.usedStockNumberSequentialCounter),
    } : {
      ...settings,
      newStockNumberPrefixRule: tempValues.newStockNumberPrefixRule,
      newStockNumberSuffixRule: tempValues.newStockNumberSuffixRule,
      newStockNumberSequentialCounter: Number(tempValues.newStockNumberSequentialCounter),
    };

    updateMutation.mutate(updatedSettings);
  };

  const handleRuleChange = (type: 'used' | 'new', ruleType: 'prefix' | 'suffix', newRule: StockNumberRule) => {
    const prefix = type === 'used' ? 'usedStockNumber' : 'newStockNumber';
    const key = ruleType === 'prefix' ? `${prefix}PrefixRule` : `${prefix}SuffixRule`;
    setTempValues({
      ...tempValues,
      [key]: newRule
    });
  };

  const generateStockNumberPreview = (type: 'used' | 'new'): string => {
    const prefix = type === 'used' ? 'usedStockNumber' : 'newStockNumber';
    const isEditing = editMode === `stockNumber-${type}`;
    
    const prefixRule = isEditing 
      ? tempValues[`${prefix}PrefixRule`] 
      : settings?.[`${prefix}PrefixRule` as keyof Settings];
    const suffixRule = isEditing 
      ? tempValues[`${prefix}SuffixRule`] 
      : settings?.[`${prefix}SuffixRule` as keyof Settings];
    const sequentialNumber = isEditing 
      ? tempValues[`${prefix}SequentialCounter`] 
      : settings?.[`${prefix}SequentialCounter` as keyof Settings];

    // Generate prefix
    let prefixStr = "";
    if (prefixRule?.type === "source" && settings?.sources?.[0]) {
      prefixStr = settings.sources[0].substring(0, 2).toUpperCase();
    } else if (prefixRule?.type === "buyer") {
      prefixStr = 'BUY';
    } else if (prefixRule?.type === "custom" && "customValue" in prefixRule) {
      prefixStr = prefixRule.customValue;
    }

    // Generate suffix
    let suffixStr = "";
    if (suffixRule?.type === "source" && settings?.sources?.[0]) {
      suffixStr = settings.sources[0].substring(0, 2).toUpperCase();
    } else if (suffixRule?.type === "buyer") {
      suffixStr = 'BUY';
    } else if (suffixRule?.type === "custom" && "customValue" in suffixRule) {
      suffixStr = suffixRule.customValue;
    }

    return `${prefixStr}${sequentialNumber || (type === 'used' ? 1004 : 2000)}${suffixStr}`;
  };

  const handleCounterChange = (type: 'used' | 'new', e: any) => {
    const value = e.target.value;
    const prefix = type === 'used' ? 'usedStockNumber' : 'newStockNumber';
    
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setTempValues(prev => ({
        ...prev,
        [`${prefix}SequentialCounter`]: value,
      }));
    }
  };


  // Helper function to get status color based on status value
  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('stock') || statusLower.includes('available')) return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    if (statusLower.includes('sold')) return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    if (statusLower.includes('recall') || statusLower.includes('service')) return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
    if (statusLower.includes('received') || statusLower.includes('transit')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
    if (statusLower.includes('reserved') || statusLower.includes('hold')) return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
    if (statusLower.includes('demo')) return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
    if (statusLower.includes('wholesale') || statusLower.includes('auction')) return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
  };

  // Helper function to get make color
  const getMakeColor = (make: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200',
    ];
    return colors[make.length % colors.length];
  };

  // Helper function to get source color
  const getSourceColor = (source: string): string => {
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('blue book') || sourceLower.includes('kelley')) return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
    if (sourceLower.includes('trade')) return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    if (sourceLower.includes('auction')) return 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200';
    if (sourceLower.includes('lease')) return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
    if (sourceLower.includes('direct') || sourceLower.includes('purchase')) return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
    return 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg text-red-600">Failed to load settings</div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-screen bg-gray-50/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="settings-title">Settings</h1>
              <p className="text-gray-600 text-lg">Manage system configuration and dropdown values</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">

          <StockNumberCard settings={settings} type="used" />
          <StockNumberCard settings={settings} type="new"/>

          {/* Used Vehicle Stock Number Card */}
          {/* {renderStockNumberCard('used')} */}

          {/* New Vehicle Stock Number Card */}
          {/* {renderStockNumberCard('new')}   */}

          {/* Users Section - Full Width */}
          <Card className="mt-8 mb-8 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between p-8 pb-6">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Users</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Manage user roles and codes</CardDescription>
              </div>
              {editMode !== "users" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit("users")}
                  className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors p-0"
                  data-testid="edit-users-button"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-8 pt-8 mb-8">
              {editMode === "users" ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {(tempValues.users || []).map((user: any, index: number) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/30"
                      >
                        {/* User Code */}
                        <Input
                          placeholder="User Code"
                          value={user.code}
                          onChange={(e) => handleItemChange("users", index, e.target.value, "code")}
                          className="w-24 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          data-testid={`user-code-input-${index}`}
                        />

                        {/* User Name */}
                        <Input
                          placeholder="User Name"
                          value={user.name}
                          onChange={(e) => handleItemChange("users", index, e.target.value, "name")}
                          className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          data-testid={`user-name-input-${index}`}
                        />

                        {/* Multi-role Dropdown */}
                        <Select
                          onValueChange={(val) => {
                            const newRoles = user.roles?.includes(val)
                              ? user.roles.filter((r: any) => r !== val)
                              : [...(user.roles || []), val];
                            handleItemChange("users", index, newRoles, "roles");
                          }}
                        >
                          <SelectTrigger className="flex-1">
                            {user.roles?.length ? (
                              <span>
                                {user.roles
                                  .map((r: any) => rolesList.find((rl) => rl.id === r)?.name)
                                  .join(", ")}
                              </span>
                            ) : (
                              <span className="text-gray-400">Select Roles</span>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {rolesList.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" checked={user.roles?.includes(role.id)} readOnly />
                                  {role.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>


                        {/* Remove User */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem("users", index)}
                          className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300 self-start"
                          data-testid={`remove-user-${index}`}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add User */}
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleAddItem("users")}
                      className="border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      data-testid="add-user-button"
                    >
                      <Plus className="w-4 h-4 mr-2 text-blue-600" />
                      Add User
                    </Button>
                  </div>

                  {/* Save / Cancel */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleSave("users")}
                      disabled={updateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                      data-testid="save-users-button"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {settings?.users?.map((user: UserOptionType, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:bg-gray-50/80 transition-all duration-200 shadow-sm"
                        data-testid={`user-item-${index}`}
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full text-xs font-mono text-white shadow-sm">
                          {user.code}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-600">
                            {user.roles?.map((r) => rolesList.find((rl) => rl.id === r)?.name).join(", ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-8">
                    <CsvUpload
                      type="users"
                      onSuccess={() =>
                        queryClient.invalidateQueries({
                          queryKey: ["/api/settings"],
                        })
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>


          <div className="grid gap-8 lg:grid-cols-2">


            {/* Sources Section */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between p-8 pb-6">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Sources</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">Vehicle acquisition sources</CardDescription>
                </div>
                {editMode !== "sources" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("sources")}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors p-0"
                    data-testid="edit-sources-button"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {editMode === "sources" ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      {(tempValues.sources || []).map((source: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={source}
                            onChange={(e) => handleItemChange("sources", index, e.target.value)}
                            className="w-44 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                            data-testid={`source-input-${index}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem("sources", index)}
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                            data-testid={`remove-source-${index}`}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => handleAddItem("sources")} className="border-blue-200 hover:bg-blue-50 hover:border-blue-300" data-testid="add-source-button">
                        <Plus className="w-4 h-4 mr-2 text-blue-600" />
                        Add Source
                      </Button>
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <Button onClick={() => handleSave("sources")} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700" data-testid="save-sources-button">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="border-gray-200 hover:bg-gray-50">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {settings.sources.map((source, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-default shadow-sm ${getSourceColor(source)}`}
                          data-testid={`source-badge-${index}`}
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-100 mt-8">
                      <CsvUpload
                        type="sources"
                        onSuccess={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["/api/settings"],
                          })
                        }
                      />
                    </div>
                  </>
                )}

              </CardContent>
            </Card>



            {/* Status Section */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between p-8 pb-6">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Status</CardTitle>
                  <CardDescription className="text-gray-600 mt-1">Vehicle status options</CardDescription>
                </div>
                {editMode !== "status" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit("status")}
                    className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors p-0"
                    data-testid="edit-status-button"
                  >
                    <Pencil className="w-4 h-4 text-gray-600" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {editMode === "status" ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-3">
                      {(tempValues.status || []).map((status: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={status}
                            onChange={(e) => handleItemChange("status", index, e.target.value)}
                            className="w-36 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                            data-testid={`status-input-${index}`}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem("status", index)}
                            className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                            data-testid={`remove-status-${index}`}
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => handleAddItem("status")} className="border-blue-200 hover:bg-blue-50 hover:border-blue-300" data-testid="add-status-button">
                        <Plus className="w-4 h-4 mr-2 text-blue-600" />
                        Add Status
                      </Button>
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-100">
                      <Button onClick={() => handleSave("status")} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700" data-testid="save-status-button">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="border-gray-200 hover:bg-gray-50">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="flex gap-3 min-w-max">
                        {settings.status.map((status, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-default shadow-sm ${getStatusColor(status)}`}
                            data-testid={`status-badge-${index}`}
                          >
                            {status}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-gray-100 mt-8">
                      <CsvUpload
                        type="status"
                        onSuccess={() =>
                          queryClient.invalidateQueries({
                            queryKey: ["/api/settings"],
                          })
                        }
                      />
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          </div>

          {/* Colors Section - Full Width */}
          <Card className="mt-8 mb-32 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between p-8 pb-6">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Colors</CardTitle>
                <CardDescription className="text-gray-600 mt-1">Available vehicle colors with codes</CardDescription>
              </div>
              {editMode !== "colors" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit("colors")}
                  className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors p-0"
                  data-testid="edit-colors-button"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {editMode === "colors" ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    {(tempValues.colors || []).map((color: ColorOptionType, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/30">
                        <Input
                          placeholder="Code"
                          value={color.code}
                          onChange={(e) => handleItemChange("colors", index, e.target.value, "code")}
                          className="w-24 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          data-testid={`color-code-input-${index}`}
                        />
                        <Input
                          placeholder="Color Name"
                          value={color.name}
                          onChange={(e) => handleItemChange("colors", index, e.target.value, "name")}
                          className="flex-1 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                          data-testid={`color-name-input-${index}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveItem("colors", index)}
                          className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:border-red-300"
                          data-testid={`remove-color-${index}`}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => handleAddItem("colors")} className="border-blue-200 hover:bg-blue-50 hover:border-blue-300" data-testid="add-color-button">
                      <Plus className="w-4 h-4 mr-2 text-blue-600" />
                      Add Color
                    </Button>
                  </div>
                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button onClick={() => handleSave("colors")} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700" data-testid="save-colors-button">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="border-gray-200 hover:bg-gray-50">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {settings.colors.map((color, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50/50 border border-gray-200 rounded-xl hover:bg-gray-50/80 transition-all duration-200 shadow-sm"
                      data-testid={`color-item-${index}`}
                    >
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full text-xs font-mono text-white shadow-sm">
                        {color.code}
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">{color.name}</span>
                    </div>
                  ))}

                </div>
                   <div className="pt-3 border-t border-gray-100 mt-8">
                <CsvUpload
                  type="colors"
                  onSuccess={() =>
                    queryClient.invalidateQueries({
                      queryKey: ["/api/settings"],
                    })
                  }
                />
              </div>
</>
              )}
           
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}




















