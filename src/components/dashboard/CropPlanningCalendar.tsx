import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Sprout,
  Scissors,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from "lucide-react";

interface CropPlan {
  id: string;
  fieldId: string;
  fieldName: string;
  crop: string;
  variety?: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'failed';
  area: number; // in acres
  expectedYield: number; // in quintals
  actualYield?: number;
  notes?: string;
  soilPreparation?: string;
  irrigationSchedule?: string;
}

interface CropRotation {
  id: string;
  fieldId: string;
  fieldName: string;
  currentCrop: string;
  nextCrop: string;
  reason: string;
  benefits: string[];
}

interface CropPlanningCalendarProps {
  userType?: "farmer" | "seller" | "admin";
}

export function CropPlanningCalendar({ userType = "farmer" }: CropPlanningCalendarProps) {
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([
    {
      id: "1",
      fieldId: "1",
      fieldName: "North Field",
      crop: "Wheat",
      variety: "HD-2967",
      plantingDate: new Date(2024, 10, 15), // November 15, 2024
      expectedHarvestDate: new Date(2025, 3, 15), // April 15, 2025
      status: "planted",
      area: 5.2,
      expectedYield: 26,
      notes: "Good soil moisture, timely planting",
      soilPreparation: "Deep ploughing done",
      irrigationSchedule: "Every 10-12 days"
    },
    {
      id: "2",
      fieldId: "2",
      fieldName: "South Field",
      crop: "Rice",
      variety: "PR-126",
      plantingDate: new Date(2024, 5, 20), // June 20, 2024
      expectedHarvestDate: new Date(2024, 9, 20), // October 20, 2024
      actualHarvestDate: new Date(2024, 9, 18),
      status: "harvested",
      area: 3.8,
      expectedYield: 19,
      actualYield: 21.5,
      notes: "Good monsoon, excellent yield",
      soilPreparation: "Puddling done",
      irrigationSchedule: "Continuous flooding"
    },
    {
      id: "3",
      fieldId: "3",
      fieldName: "East Field",
      crop: "Maize",
      variety: "PMH-1",
      plantingDate: new Date(2024, 11, 1), // December 1, 2024
      expectedHarvestDate: new Date(2025, 2, 15), // March 15, 2025
      status: "planned",
      area: 4.1,
      expectedYield: 20.5,
      notes: "Planning for winter crop",
      soilPreparation: "Pending",
      irrigationSchedule: "Drip irrigation planned"
    }
  ]);

  const [cropRotations, setCropRotations] = useState<CropRotation[]>([
    {
      id: "1",
      fieldId: "1",
      fieldName: "North Field",
      currentCrop: "Rice",
      nextCrop: "Wheat",
      reason: "Rice leaves soil rich in nitrogen, good for wheat",
      benefits: ["Better soil fertility", "Reduced pest pressure", "Improved yield"]
    },
    {
      id: "2",
      fieldId: "2",
      fieldName: "South Field",
      currentCrop: "Wheat",
      nextCrop: "Maize",
      reason: "Maize helps break pest cycles from wheat",
      benefits: ["Pest management", "Soil structure improvement", "Nutrient balance"]
    }
  ]);

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [isRotationDialogOpen, setIsRotationDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CropPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newPlan, setNewPlan] = useState<Partial<CropPlan>>({
    fieldId: "",
    fieldName: "",
    crop: "",
    variety: "",
    plantingDate: new Date(),
    expectedHarvestDate: new Date(),
    status: "planned",
    area: 0,
    expectedYield: 0,
    notes: "",
    soilPreparation: "",
    irrigationSchedule: ""
  });

  const [newRotation, setNewRotation] = useState<Partial<CropRotation>>({
    fieldId: "",
    fieldName: "",
    currentCrop: "",
    nextCrop: "",
    reason: "",
    benefits: []
  });

  const crops = ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Soybean", "Groundnut", "Mustard", "Barley", "Chickpea", "Potato", "Tomato"];
  const cropVarieties: Record<string, string[]> = {
    "Wheat": ["HD-2967", "PBW-725", "DBW-187", "HD-3086"],
    "Rice": ["PR-126", "PB-1509", "CR-1009", "PR-121"],
    "Maize": ["PMH-1", "PMH-5", "HQPM-1", "DKC-9099"],
    "Cotton": ["Bt Cotton", "Hybrid Cotton", "Desi Cotton"],
    "Sugarcane": ["Co-0238", "Co-0118", "Co-86032"],
    "Soybean": ["JS-9560", "JS-9305", "PS-1347"],
    "Groundnut": ["GG-20", "TG-26", "Kadiri-6"],
    "Mustard": ["Pusa Bold", "Varuna", "Kranti"],
    "Barley": ["RD-2715", "RD-2503", "DWRUB-52"],
    "Chickpea": ["Pusa-256", "JG-11", "Radhey"],
    "Potato": ["Kufri Jyoti", "Kufri Chandramukhi", "Kufri Pukhraj"],
    "Tomato": ["Pusa Ruby", "Pusa Early Dwarf", "Solan Lalima"]
  };

  const fields = [
    { id: "1", name: "North Field", area: 5.2 },
    { id: "2", name: "South Field", area: 3.8 },
    { id: "3", name: "East Field", area: 4.1 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "planted": return "bg-yellow-100 text-yellow-800";
      case "growing": return "bg-green-100 text-green-800";
      case "harvested": return "bg-purple-100 text-purple-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "planned": return <Clock className="h-4 w-4" />;
      case "planted": return <Sprout className="h-4 w-4" />;
      case "growing": return <TrendingUp className="h-4 w-4" />;
      case "harvested": return <CheckCircle className="h-4 w-4" />;
      case "failed": return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateHarvestDate = (crop: string, plantingDate: Date): Date => {
    const cropCycles: Record<string, number> = {
      "Wheat": 150, // ~5 months
      "Rice": 120, // ~4 months
      "Maize": 90, // ~3 months
      "Cotton": 180, // ~6 months
      "Sugarcane": 365, // ~12 months
      "Soybean": 100, // ~3.3 months
      "Groundnut": 120, // ~4 months
      "Mustard": 120, // ~4 months
      "Barley": 120, // ~4 months
      "Chickpea": 100, // ~3.3 months
      "Potato": 90, // ~3 months
      "Tomato": 120 // ~4 months
    };

    const days = cropCycles[crop] || 120;
    const harvestDate = new Date(plantingDate);
    harvestDate.setDate(harvestDate.getDate() + days);
    return harvestDate;
  };

  const handleAddPlan = () => {
    if (newPlan.fieldId && newPlan.crop && newPlan.plantingDate) {
      const field = fields.find(f => f.id === newPlan.fieldId);
      const harvestDate = newPlan.expectedHarvestDate || calculateHarvestDate(newPlan.crop, newPlan.plantingDate);

      const plan: CropPlan = {
        id: Date.now().toString(),
        fieldId: newPlan.fieldId,
        fieldName: field?.name || "",
        crop: newPlan.crop,
        variety: newPlan.variety,
        plantingDate: newPlan.plantingDate,
        expectedHarvestDate: harvestDate,
        status: newPlan.status as CropPlan['status'] || "planned",
        area: newPlan.area || field?.area || 0,
        expectedYield: newPlan.expectedYield || 0,
        notes: newPlan.notes,
        soilPreparation: newPlan.soilPreparation,
        irrigationSchedule: newPlan.irrigationSchedule
      };
      setCropPlans([...cropPlans, plan]);
      setNewPlan({
        fieldId: "",
        fieldName: "",
        crop: "",
        variety: "",
        plantingDate: new Date(),
        expectedHarvestDate: new Date(),
        status: "planned",
        area: 0,
        expectedYield: 0,
        notes: "",
        soilPreparation: "",
        irrigationSchedule: ""
      });
      setIsPlanDialogOpen(false);
    }
  };

  const handleEditPlan = (plan: CropPlan) => {
    setEditingPlan(plan);
    setNewPlan({ ...plan });
  };

  const handleUpdatePlan = () => {
    if (editingPlan && newPlan.fieldId && newPlan.crop) {
      setCropPlans(cropPlans.map(p =>
        p.id === editingPlan.id
          ? { ...p, ...newPlan, status: newPlan.status as CropPlan['status'] }
          : p
      ));
      setEditingPlan(null);
      setNewPlan({
        fieldId: "",
        fieldName: "",
        crop: "",
        variety: "",
        plantingDate: new Date(),
        expectedHarvestDate: new Date(),
        status: "planned",
        area: 0,
        expectedYield: 0,
        notes: "",
        soilPreparation: "",
        irrigationSchedule: ""
      });
    }
  };

  const handleDeletePlan = (planId: string) => {
    setCropPlans(cropPlans.filter(p => p.id !== planId));
  };

  const handleAddRotation = () => {
    if (newRotation.fieldId && newRotation.currentCrop && newRotation.nextCrop) {
      const field = fields.find(f => f.id === newRotation.fieldId);
      const rotation: CropRotation = {
        id: Date.now().toString(),
        fieldId: newRotation.fieldId,
        fieldName: field?.name || "",
        currentCrop: newRotation.currentCrop,
        nextCrop: newRotation.nextCrop,
        reason: newRotation.reason || "",
        benefits: newRotation.benefits || []
      };
      setCropRotations([...cropRotations, rotation]);
      setNewRotation({
        fieldId: "",
        fieldName: "",
        currentCrop: "",
        nextCrop: "",
        reason: "",
        benefits: []
      });
      setIsRotationDialogOpen(false);
    }
  };

  const getUpcomingActivities = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return cropPlans.filter(plan => {
      const plantingDate = new Date(plan.plantingDate);
      const harvestDate = new Date(plan.expectedHarvestDate);
      return (plantingDate >= today && plantingDate <= nextWeek) ||
             (harvestDate >= today && harvestDate <= nextWeek);
    });
  };

  const upcomingActivities = getUpcomingActivities();

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Crop Planning Calendar
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Crop Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Crop Plan</DialogTitle>
                  <DialogDescription>Create a new crop planting schedule for your fields.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="plan-field">Field</Label>
                      <Select value={newPlan.fieldId} onValueChange={(value) => {
                        const field = fields.find(f => f.id === value);
                        setNewPlan({
                          ...newPlan,
                          fieldId: value,
                          fieldName: field?.name || "",
                          area: field?.area || 0
                        });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map(field => (
                            <SelectItem key={field.id} value={field.id}>
                              {field.name} ({field.area} acres)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="plan-crop">Crop</Label>
                      <Select value={newPlan.crop} onValueChange={(value) => {
                        setNewPlan({ ...newPlan, crop: value, variety: "" });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map(crop => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {newPlan.crop && cropVarieties[newPlan.crop] && (
                    <div>
                      <Label htmlFor="plan-variety">Variety (optional)</Label>
                      <Select value={newPlan.variety} onValueChange={(value) => setNewPlan({ ...newPlan, variety: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select variety" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropVarieties[newPlan.crop].map(variety => (
                            <SelectItem key={variety} value={variety}>{variety}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="planting-date">Planting Date</Label>
                      <Input
                        id="planting-date"
                        type="date"
                        value={newPlan.plantingDate?.toISOString().split('T')[0]}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          const harvestDate = calculateHarvestDate(newPlan.crop || "", date);
                          setNewPlan({
                            ...newPlan,
                            plantingDate: date,
                            expectedHarvestDate: harvestDate
                          });
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected-harvest">Expected Harvest</Label>
                      <Input
                        id="expected-harvest"
                        type="date"
                        value={newPlan.expectedHarvestDate?.toISOString().split('T')[0]}
                        onChange={(e) => setNewPlan({ ...newPlan, expectedHarvestDate: new Date(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="plan-status">Status</Label>
                      <Select value={newPlan.status} onValueChange={(value) => setNewPlan({ ...newPlan, status: value as CropPlan['status'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planned">Planned</SelectItem>
                          <SelectItem value="planted">Planted</SelectItem>
                          <SelectItem value="growing">Growing</SelectItem>
                          <SelectItem value="harvested">Harvested</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="plan-area">Area (acres)</Label>
                      <Input
                        id="plan-area"
                        type="number"
                        value={newPlan.area}
                        onChange={(e) => setNewPlan({ ...newPlan, area: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected-yield">Expected Yield (quintals)</Label>
                      <Input
                        id="expected-yield"
                        type="number"
                        value={newPlan.expectedYield}
                        onChange={(e) => setNewPlan({ ...newPlan, expectedYield: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="soil-prep">Soil Preparation</Label>
                    <Textarea
                      id="soil-prep"
                      value={newPlan.soilPreparation}
                      onChange={(e) => setNewPlan({ ...newPlan, soilPreparation: e.target.value })}
                      placeholder="Describe soil preparation activities"
                    />
                  </div>

                  <div>
                    <Label htmlFor="irrigation">Irrigation Schedule</Label>
                    <Textarea
                      id="irrigation"
                      value={newPlan.irrigationSchedule}
                      onChange={(e) => setNewPlan({ ...newPlan, irrigationSchedule: e.target.value })}
                      placeholder="Describe irrigation plan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="plan-notes">Notes</Label>
                    <Textarea
                      id="plan-notes"
                      value={newPlan.notes}
                      onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                      placeholder="Additional notes"
                    />
                  </div>

                  <Button onClick={handleAddPlan} className="w-full">
                    Add Crop Plan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isRotationDialogOpen} onOpenChange={setIsRotationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Add Rotation
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Crop Rotation</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="rotation-field">Field</Label>
                    <Select value={newRotation.fieldId} onValueChange={(value) => {
                      const field = fields.find(f => f.id === value);
                      setNewRotation({ ...newRotation, fieldId: value, fieldName: field?.name || "" });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.map(field => (
                          <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="current-crop">Current Crop</Label>
                      <Select value={newRotation.currentCrop} onValueChange={(value) => setNewRotation({ ...newRotation, currentCrop: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select current crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map(crop => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="next-crop">Next Crop</Label>
                      <Select value={newRotation.nextCrop} onValueChange={(value) => setNewRotation({ ...newRotation, nextCrop: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select next crop" />
                        </SelectTrigger>
                        <SelectContent>
                          {crops.map(crop => (
                            <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="rotation-reason">Reason for Rotation</Label>
                    <Textarea
                      id="rotation-reason"
                      value={newRotation.reason}
                      onChange={(e) => setNewRotation({ ...newRotation, reason: e.target.value })}
                      placeholder="Why this crop rotation?"
                    />
                  </div>
                  <Button onClick={handleAddRotation} className="w-full">
                    Add Crop Rotation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plans" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plans">Crop Plans</TabsTrigger>
            <TabsTrigger value="rotations">Crop Rotations</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4">
            {/* Upcoming Activities Alert */}
            {upcomingActivities.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-800">Upcoming Activities (Next 7 days)</h4>
                  </div>
                  <div className="space-y-2">
                    {upcomingActivities.map(plan => (
                      <div key={plan.id} className="flex items-center justify-between text-sm">
                        <span>{plan.crop} in {plan.fieldName}</span>
                        <div className="flex gap-2">
                          {new Date(plan.plantingDate) >= new Date() && new Date(plan.plantingDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                              Planting: {plan.plantingDate.toLocaleDateString()}
                            </Badge>
                          )}
                          {new Date(plan.expectedHarvestDate) >= new Date() && new Date(plan.expectedHarvestDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                            <Badge variant="outline" className="text-green-700 border-green-300">
                              Harvest: {plan.expectedHarvestDate.toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Crop Plans List */}
            <div className="space-y-4">
              {cropPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Sprout className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{plan.crop}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{plan.fieldName} ({plan.area} acres)</span>
                          </div>
                          {plan.variety && (
                            <Badge variant="outline" className="mt-1">{plan.variety}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(plan.status)}>
                          {getStatusIcon(plan.status)}
                          <span className="ml-1">{plan.status}</span>
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Planting:</span>
                        <span className="ml-2">{plan.plantingDate.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Expected Harvest:</span>
                        <span className="ml-2">{plan.expectedHarvestDate.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Expected Yield:</span>
                        <span className="ml-2">{plan.expectedYield} quintals</span>
                      </div>
                    </div>

                    {plan.actualHarvestDate && plan.actualYield && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <span className="font-medium">Actual Harvest:</span>
                        <span className="ml-2">{plan.actualHarvestDate.toLocaleDateString()}</span>
                        <span className="ml-4 font-medium">Actual Yield:</span>
                        <span className="ml-2">{plan.actualYield} quintals</span>
                      </div>
                    )}

                    {(plan.soilPreparation || plan.irrigationSchedule || plan.notes) && (
                      <div className="mt-4 space-y-2">
                        {plan.soilPreparation && (
                          <div>
                            <span className="font-medium text-sm">Soil Preparation:</span>
                            <p className="text-sm text-muted-foreground mt-1">{plan.soilPreparation}</p>
                          </div>
                        )}
                        {plan.irrigationSchedule && (
                          <div>
                            <span className="font-medium text-sm">Irrigation:</span>
                            <p className="text-sm text-muted-foreground mt-1">{plan.irrigationSchedule}</p>
                          </div>
                        )}
                        {plan.notes && (
                          <div>
                            <span className="font-medium text-sm">Notes:</span>
                            <p className="text-sm text-muted-foreground mt-1">{plan.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rotations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cropRotations.map((rotation) => (
                <Card key={rotation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <RotateCcw className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-semibold">{rotation.fieldName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {rotation.currentCrop} → {rotation.nextCrop}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Reason:</span> {rotation.reason}
                      </p>
                      <div>
                        <span className="font-medium text-sm">Benefits:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rotation.benefits.map((benefit, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar View</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activities for {selectedDate?.toLocaleDateString()}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {cropPlans
                      .filter(plan => {
                        const planting = new Date(plan.plantingDate).toDateString();
                        const harvest = new Date(plan.expectedHarvestDate).toDateString();
                        return planting === selectedDate?.toDateString() || harvest === selectedDate?.toDateString();
                      })
                      .map(plan => (
                        <div key={plan.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{plan.crop}</span>
                            <Badge className={getStatusColor(plan.status)}>
                              {new Date(plan.plantingDate).toDateString() === selectedDate?.toDateString() ? 'Planting' : 'Harvest'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.fieldName}</p>
                        </div>
                      ))}
                    {cropPlans.filter(plan => {
                      const planting = new Date(plan.plantingDate).toDateString();
                      const harvest = new Date(plan.expectedHarvestDate).toDateString();
                      return planting === selectedDate?.toDateString() || harvest === selectedDate?.toDateString();
                    }).length === 0 && (
                      <p className="text-muted-foreground text-center py-4">No activities scheduled</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Plan Dialog */}
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Crop Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-plan-field">Field</Label>
                  <Select value={newPlan.fieldId} onValueChange={(value) => {
                    const field = fields.find(f => f.id === value);
                    setNewPlan({
                      ...newPlan,
                      fieldId: value,
                      fieldName: field?.name || "",
                      area: field?.area || 0
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name} ({field.area} acres)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-plan-crop">Crop</Label>
                  <Select value={newPlan.crop} onValueChange={(value) => {
                    setNewPlan({ ...newPlan, crop: value, variety: "" });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map(crop => (
                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newPlan.crop && cropVarieties[newPlan.crop] && (
                <div>
                  <Label htmlFor="edit-plan-variety">Variety</Label>
                  <Select value={newPlan.variety} onValueChange={(value) => setNewPlan({ ...newPlan, variety: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cropVarieties[newPlan.crop].map(variety => (
                        <SelectItem key={variety} value={variety}>{variety}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-planting-date">Planting Date</Label>
                  <Input
                    id="edit-planting-date"
                    type="date"
                    value={newPlan.plantingDate?.toISOString().split('T')[0]}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const harvestDate = calculateHarvestDate(newPlan.crop || "", date);
                      setNewPlan({
                        ...newPlan,
                        plantingDate: date,
                        expectedHarvestDate: harvestDate
                      });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-expected-harvest">Expected Harvest</Label>
                  <Input
                    id="edit-expected-harvest"
                    type="date"
                    value={newPlan.expectedHarvestDate?.toISOString().split('T')[0]}
                    onChange={(e) => setNewPlan({ ...newPlan, expectedHarvestDate: new Date(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-plan-status">Status</Label>
                  <Select value={newPlan.status} onValueChange={(value) => setNewPlan({ ...newPlan, status: value as CropPlan['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="planted">Planted</SelectItem>
                      <SelectItem value="growing">Growing</SelectItem>
                      <SelectItem value="harvested">Harvested</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-plan-area">Area (acres)</Label>
                  <Input
                    id="edit-plan-area"
                    type="number"
                    value={newPlan.area}
                    onChange={(e) => setNewPlan({ ...newPlan, area: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-expected-yield">Expected Yield (quintals)</Label>
                  <Input
                    id="edit-expected-yield"
                    type="number"
                    value={newPlan.expectedYield}
                    onChange={(e) => setNewPlan({ ...newPlan, expectedYield: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-soil-prep">Soil Preparation</Label>
                <Textarea
                  id="edit-soil-prep"
                  value={newPlan.soilPreparation}
                  onChange={(e) => setNewPlan({ ...newPlan, soilPreparation: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-irrigation">Irrigation Schedule</Label>
                <Textarea
                  id="edit-irrigation"
                  value={newPlan.irrigationSchedule}
                  onChange={(e) => setNewPlan({ ...newPlan, irrigationSchedule: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="edit-plan-notes">Notes</Label>
                <Textarea
                  id="edit-plan-notes"
                  value={newPlan.notes}
                  onChange={(e) => setNewPlan({ ...newPlan, notes: e.target.value })}
                />
              </div>

              <Button onClick={handleUpdatePlan} className="w-full">
                Update Crop Plan
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}