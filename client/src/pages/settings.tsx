import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Plus, X, Save, Edit } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Settings, ModelSeriesType, ColorOptionType } from "@shared/schema";

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
    } else if (section === "years") {
      const currentYear = new Date().getFullYear();
      setTempValues({
        ...tempValues,
        [section]: [...currentValues, currentYear]
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

  const handleSeriesChange = (modelIndex: number, seriesIndex: number, value: string) => {
    const currentModels = [...tempValues.model];
    const currentSeries = [...currentModels[modelIndex].Series];
    currentSeries[seriesIndex] = value;
    currentModels[modelIndex] = { ...currentModels[modelIndex], Series: currentSeries };
    setTempValues({
      ...tempValues,
      model: currentModels
    });
  };

  const handleAddSeries = (modelIndex: number) => {
    const currentModels = [...tempValues.model];
    currentModels[modelIndex] = {
      ...currentModels[modelIndex],
      Series: [...currentModels[modelIndex].Series, ""]
    };
    setTempValues({
      ...tempValues,
      model: currentModels
    });
  };

  const handleRemoveSeries = (modelIndex: number, seriesIndex: number) => {
    const currentModels = [...tempValues.model];
    const currentSeries = [...currentModels[modelIndex].Series];
    currentSeries.splice(seriesIndex, 1);
    currentModels[modelIndex] = { ...currentModels[modelIndex], Series: currentSeries };
    setTempValues({
      ...tempValues,
      model: currentModels
    });
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="w-8 h-8" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="settings-title">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and dropdown values</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Makes Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Makes</CardTitle>
              <CardDescription>Vehicle manufacturers available in the system</CardDescription>
            </div>
            {editMode !== "make" && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleEdit("make")}
                data-testid="edit-makes-button"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editMode === "make" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(tempValues.make || []).map((make: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={make}
                        onChange={(e) => handleItemChange("make", index, e.target.value)}
                        className="w-32"
                        data-testid={`make-input-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem("make", index)}
                        data-testid={`remove-make-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAddItem("make")} data-testid="add-make-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Make
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("make")} disabled={updateMutation.isPending} data-testid="save-makes-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {settings.make.map((make, index) => (
                  <Badge key={index} variant="secondary" data-testid={`make-badge-${index}`}>
                    {make}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sources Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Sources</CardTitle>
              <CardDescription>Vehicle acquisition sources</CardDescription>
            </div>
            {editMode !== "sources" && (
              <Button variant="outline" size="sm" onClick={() => handleEdit("sources")} data-testid="edit-sources-button">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editMode === "sources" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(tempValues.sources || []).map((source: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={source}
                        onChange={(e) => handleItemChange("sources", index, e.target.value)}
                        className="w-40"
                        data-testid={`source-input-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem("sources", index)}
                        data-testid={`remove-source-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAddItem("sources")} data-testid="add-source-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Source
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("sources")} disabled={updateMutation.isPending} data-testid="save-sources-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {settings.sources.map((source, index) => (
                  <Badge key={index} variant="secondary" data-testid={`source-badge-${index}`}>
                    {source}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Years Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Years</CardTitle>
              <CardDescription>Available vehicle model years</CardDescription>
            </div>
            {editMode !== "years" && (
              <Button variant="outline" size="sm" onClick={() => handleEdit("years")} data-testid="edit-years-button">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editMode === "years" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(tempValues.years || []).map((year: number, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={year}
                        onChange={(e) => handleItemChange("years", index, parseInt(e.target.value))}
                        className="w-24"
                        data-testid={`year-input-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem("years", index)}
                        data-testid={`remove-year-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAddItem("years")} data-testid="add-year-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Year
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("years")} disabled={updateMutation.isPending} data-testid="save-years-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {settings.years.sort((a, b) => b - a).map((year, index) => (
                  <Badge key={index} variant="secondary" data-testid={`year-badge-${index}`}>
                    {year}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Status</CardTitle>
              <CardDescription>Vehicle status options</CardDescription>
            </div>
            {editMode !== "status" && (
              <Button variant="outline" size="sm" onClick={() => handleEdit("status")} data-testid="edit-status-button">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editMode === "status" ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(tempValues.status || []).map((status: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={status}
                        onChange={(e) => handleItemChange("status", index, e.target.value)}
                        className="w-32"
                        data-testid={`status-input-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem("status", index)}
                        data-testid={`remove-status-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAddItem("status")} data-testid="add-status-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Status
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("status")} disabled={updateMutation.isPending} data-testid="save-status-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {settings.status.map((status, index) => (
                  <Badge key={index} variant="secondary" data-testid={`status-badge-${index}`}>
                    {status}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Models Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Models & Series</CardTitle>
              <CardDescription>Vehicle models and their available series</CardDescription>
            </div>
            {editMode !== "model" && (
              <Button variant="outline" size="sm" onClick={() => handleEdit("model")} data-testid="edit-models-button">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editMode === "model" ? (
              <div className="space-y-6">
                {(tempValues.model || []).map((model: ModelSeriesType, modelIndex: number) => (
                  <div key={modelIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`model-${modelIndex}`}>Model Name:</Label>
                      <Input
                        id={`model-${modelIndex}`}
                        value={model.name}
                        onChange={(e) => handleItemChange("model", modelIndex, e.target.value, "name")}
                        className="w-48"
                        data-testid={`model-name-input-${modelIndex}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem("model", modelIndex)}
                        data-testid={`remove-model-${modelIndex}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Series:</Label>
                      <div className="flex flex-wrap gap-2">
                        {model.Series.map((series: string, seriesIndex: number) => (
                          <div key={seriesIndex} className="flex items-center gap-2">
                            <Input
                              value={series}
                              onChange={(e) => handleSeriesChange(modelIndex, seriesIndex, e.target.value)}
                              className="w-40"
                              data-testid={`series-input-${modelIndex}-${seriesIndex}`}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveSeries(modelIndex, seriesIndex)}
                              data-testid={`remove-series-${modelIndex}-${seriesIndex}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSeries(modelIndex)}
                        data-testid={`add-series-${modelIndex}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Series
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAddItem("model")} data-testid="add-model-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Model
                  </Button>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("model")} disabled={updateMutation.isPending} data-testid="save-models-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {settings.model.map((model, index) => (
                  <div key={index} className="border rounded-lg p-4" data-testid={`model-card-${index}`}>
                    <h4 className="font-semibold mb-2">{model.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.Series.map((series, seriesIndex) => (
                        <Badge key={seriesIndex} variant="outline" data-testid={`series-badge-${index}-${seriesIndex}`}>
                          {series}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Colors Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Colors</CardTitle>
              <CardDescription>Available vehicle colors with codes</CardDescription>
            </div>
            {editMode !== "colors" && (
              <Button variant="outline" size="sm" onClick={() => handleEdit("colors")} data-testid="edit-colors-button">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {editMode === "colors" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  {(tempValues.colors || []).map((color: ColorOptionType, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Code"
                        value={color.code}
                        onChange={(e) => handleItemChange("colors", index, e.target.value, "code")}
                        className="w-24"
                        data-testid={`color-code-input-${index}`}
                      />
                      <Input
                        placeholder="Color Name"
                        value={color.name}
                        onChange={(e) => handleItemChange("colors", index, e.target.value, "name")}
                        className="flex-1"
                        data-testid={`color-name-input-${index}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem("colors", index)}
                        data-testid={`remove-color-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleAddItem("colors")} data-testid="add-color-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Color
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("colors")} disabled={updateMutation.isPending} data-testid="save-colors-button">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {settings.colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded" data-testid={`color-item-${index}`}>
                    <Badge variant="outline" className="w-16 text-xs">
                      {color.code}
                    </Badge>
                    <span className="text-sm">{color.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}