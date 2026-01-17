import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Sprout,
  Droplets,
  Mountain,
  Layers,
  Square,
  Compass
} from "lucide-react";

interface Field {
  id: string;
  name: string;
  area: number; // in acres
  soilType: string;
  currentCrop: string;
  status: 'active' | 'fallow' | 'preparing';
  coordinates: { lat: number; lng: number }[];
  notes?: string;
}

interface FarmFieldMappingProps {
  userType?: "farmer" | "seller" | "admin";
}

export function FarmFieldMapping({ userType = "farmer" }: FarmFieldMappingProps) {
  const [fields, setFields] = useState<Field[]>([
    {
      id: "1",
      name: "North Field",
      area: 5.2,
      soilType: "Clay Loam",
      currentCrop: "Wheat",
      status: "active",
      coordinates: [
        { lat: 30.3753, lng: 76.7821 },
        { lat: 30.3763, lng: 76.7831 },
        { lat: 30.3758, lng: 76.7841 },
        { lat: 30.3748, lng: 76.7836 }
      ],
      notes: "Well-irrigated field with good drainage"
    },
    {
      id: "2",
      name: "South Field",
      area: 3.8,
      soilType: "Sandy Loam",
      currentCrop: "Rice",
      status: "active",
      coordinates: [
        { lat: 30.3733, lng: 76.7821 },
        { lat: 30.3743, lng: 76.7831 },
        { lat: 30.3738, lng: 76.7841 },
        { lat: 30.3728, lng: 76.7836 }
      ],
      notes: "Requires more irrigation"
    },
    {
      id: "3",
      name: "East Field",
      area: 4.1,
      soilType: "Black Soil",
      currentCrop: "",
      status: "fallow",
      coordinates: [
        { lat: 30.3743, lng: 76.7851 },
        { lat: 30.3753, lng: 76.7861 },
        { lat: 30.3748, lng: 76.7871 },
        { lat: 30.3738, lng: 76.7866 }
      ],
      notes: "Resting for next season"
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [newField, setNewField] = useState<Partial<Field>>({
    name: "",
    area: 0,
    soilType: "",
    currentCrop: "",
    status: "fallow",
    notes: ""
  });

  const soilTypes = ["Clay Loam", "Sandy Loam", "Black Soil", "Red Soil", "Alluvial Soil", "Laterite Soil"];
  const cropTypes = ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Soybean", "Groundnut", "Mustard", "Barley", "Chickpea"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "fallow": return "bg-warning text-warning-foreground";
      case "preparing": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSoilIcon = (soilType: string) => {
    switch (soilType.toLowerCase()) {
      case "clay loam": return <Mountain className="h-4 w-4" />;
      case "sandy loam": return <Droplets className="h-4 w-4" />;
      case "black soil": return <Layers className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  const handleAddField = () => {
    if (newField.name && newField.area && newField.soilType) {
      const field: Field = {
        id: Date.now().toString(),
        name: newField.name,
        area: newField.area,
        soilType: newField.soilType,
        currentCrop: newField.currentCrop || "",
        status: newField.status as Field['status'] || "fallow",
        coordinates: [], // Would be set by map interaction
        notes: newField.notes
      };
      setFields([...fields, field]);
      setNewField({
        name: "",
        area: 0,
        soilType: "",
        currentCrop: "",
        status: "fallow",
        notes: ""
      });
      setIsAddDialogOpen(false);
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setNewField({ ...field });
  };

  const handleUpdateField = () => {
    if (editingField && newField.name && newField.area && newField.soilType) {
      setFields(fields.map(f =>
        f.id === editingField.id
          ? { ...f, ...newField, status: newField.status as Field['status'] }
          : f
      ));
      setEditingField(null);
      setNewField({
        name: "",
        area: 0,
        soilType: "",
        currentCrop: "",
        status: "fallow",
        notes: ""
      });
    }
  };

  const handleDeleteField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const totalArea = fields.reduce((sum, field) => sum + field.area, 0);
  const activeFields = fields.filter(f => f.status === "active").length;
  const fallowFields = fields.filter(f => f.status === "fallow").length;

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Farm Field Mapping
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Field</DialogTitle>
                <DialogDescription>
                  Add a new field to your farm with location, area, and crop details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="field-name">Field Name</Label>
                  <Input
                    id="field-name"
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., North Field"
                  />
                </div>
                <div>
                  <Label htmlFor="field-area">Area (acres)</Label>
                  <Input
                    id="field-area"
                    type="number"
                    value={newField.area}
                    onChange={(e) => setNewField({ ...newField, area: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="soil-type">Soil Type</Label>
                  <Select value={newField.soilType} onValueChange={(value) => setNewField({ ...newField, soilType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="current-crop">Current Crop (optional)</Label>
                  <Select value={newField.currentCrop} onValueChange={(value) => setNewField({ ...newField, currentCrop: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map(crop => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field-status">Status</Label>
                  <Select value={newField.status} onValueChange={(value) => setNewField({ ...newField, status: value as Field['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="fallow">Fallow</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="field-notes">Notes (optional)</Label>
                  <Textarea
                    id="field-notes"
                    value={newField.notes}
                    onChange={(e) => setNewField({ ...newField, notes: e.target.value })}
                    placeholder="Additional notes about the field"
                  />
                </div>
                <Button onClick={handleAddField} className="w-full">
                  Add Field
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Field Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="text-2xl font-bold text-primary">{totalArea.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Total Area (acres)</div>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-lg">
            <div className="text-2xl font-bold text-success">{activeFields}</div>
            <div className="text-sm text-muted-foreground">Active Fields</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg">
            <div className="text-2xl font-bold text-warning">{fallowFields}</div>
            <div className="text-sm text-muted-foreground">Fallow Fields</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{fields.length}</div>
            <div className="text-sm text-muted-foreground">Total Fields</div>
          </div>
        </div>

        {/* Fields List */}
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Compass className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{field.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Square className="h-3 w-3" />
                      {field.area} acres
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(field.status)}>
                    {field.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditField(field)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {getSoilIcon(field.soilType)}
                  <span>{field.soilType}</span>
                </div>
                {field.currentCrop && (
                  <div className="flex items-center gap-2">
                    <Sprout className="h-4 w-4 text-success" />
                    <span>{field.currentCrop}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{field.coordinates.length} boundary points</span>
                </div>
              </div>

              {field.notes && (
                <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                  {field.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingField} onOpenChange={() => setEditingField(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Field</DialogTitle>
              <DialogDescription>
                Update field information including name, area, soil type, and crop details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-field-name">Field Name</Label>
                <Input
                  id="edit-field-name"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-field-area">Area (acres)</Label>
                <Input
                  id="edit-field-area"
                  type="number"
                  value={newField.area}
                  onChange={(e) => setNewField({ ...newField, area: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-soil-type">Soil Type</Label>
                <Select value={newField.soilType} onValueChange={(value) => setNewField({ ...newField, soilType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {soilTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-current-crop">Current Crop</Label>
                <Select value={newField.currentCrop} onValueChange={(value) => setNewField({ ...newField, currentCrop: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-field-status">Status</Label>
                <Select value={newField.status} onValueChange={(value) => setNewField({ ...newField, status: value as Field['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="fallow">Fallow</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-field-notes">Notes</Label>
                <Textarea
                  id="edit-field-notes"
                  value={newField.notes}
                  onChange={(e) => setNewField({ ...newField, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateField} className="w-full">
                Update Field
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}