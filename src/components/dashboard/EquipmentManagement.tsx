import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  Truck,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Settings,
  Fuel,
  Gauge
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  ownership: 'owned' | 'rented' | 'leased';
  status: 'active' | 'maintenance' | 'out-of-service' | 'sold';
  location: string;
  fuelType?: string;
  fuelEfficiency?: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  maintenanceInterval: number; // days
  usageHours: number;
  notes?: string;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: Date;
  type: 'routine' | 'repair' | 'emergency';
  description: string;
  cost: number;
  performedBy: string;
  nextDueDate?: Date;
  notes?: string;
}

interface EquipmentManagementProps {
  userType?: "farmer" | "seller" | "admin";
}

export function EquipmentManagement({ userType = "farmer" }: EquipmentManagementProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([
    {
      id: "1",
      name: "Mahindra Tractor",
      type: "Tractor",
      model: "575 DI",
      purchaseDate: new Date(2022, 5, 15),
      purchasePrice: 650000,
      currentValue: 520000,
      ownership: "owned",
      status: "active",
      location: "North Field",
      fuelType: "Diesel",
      fuelEfficiency: 12,
      lastMaintenance: new Date(2024, 8, 1),
      nextMaintenance: new Date(2024, 11, 1),
      maintenanceInterval: 90,
      usageHours: 1250,
      notes: "Well maintained, good condition"
    },
    {
      id: "2",
      name: "Rice Transplanter",
      type: "Transplanter",
      model: "Kubota NSPU-68C",
      purchaseDate: new Date(2023, 2, 20),
      purchasePrice: 180000,
      currentValue: 160000,
      ownership: "owned",
      status: "maintenance",
      location: "Workshop",
      fuelType: "Petrol",
      fuelEfficiency: 8,
      lastMaintenance: new Date(2024, 9, 15),
      nextMaintenance: new Date(2025, 0, 15),
      maintenanceInterval: 90,
      usageHours: 320,
      notes: "Needs engine service"
    },
    {
      id: "3",
      name: "Sprinkler System",
      type: "Irrigation",
      model: "Rain Bird 5000",
      purchaseDate: new Date(2024, 1, 10),
      purchasePrice: 45000,
      currentValue: 42000,
      ownership: "rented",
      status: "active",
      location: "South Field",
      maintenanceInterval: 180,
      usageHours: 0,
      notes: "Monthly rental equipment"
    }
  ]);

  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([
    {
      id: "1",
      equipmentId: "1",
      equipmentName: "Mahindra Tractor",
      date: new Date(2024, 8, 1),
      type: "routine",
      description: "Oil change, filter replacement, general inspection",
      cost: 2500,
      performedBy: "Local Workshop",
      nextDueDate: new Date(2024, 11, 1),
      notes: "All systems working well"
    },
    {
      id: "2",
      equipmentId: "2",
      equipmentName: "Rice Transplanter",
      date: new Date(2024, 9, 15),
      type: "repair",
      description: "Engine tuning and carburetor cleaning",
      cost: 1800,
      performedBy: "Kubota Service Center",
      nextDueDate: new Date(2025, 0, 15),
      notes: "Performance improved significantly"
    }
  ]);

  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
    name: "",
    type: "",
    model: "",
    purchaseDate: new Date(),
    purchasePrice: 0,
    currentValue: 0,
    ownership: "owned",
    status: "active",
    location: "",
    fuelType: "",
    fuelEfficiency: 0,
    maintenanceInterval: 90,
    usageHours: 0,
    notes: ""
  });

  const [newMaintenance, setNewMaintenance] = useState<Partial<MaintenanceRecord>>({
    equipmentId: "",
    equipmentName: "",
    date: new Date(),
    type: "routine",
    description: "",
    cost: 0,
    performedBy: "",
    notes: ""
  });

  const equipmentTypes = [
    "Tractor", "Harvester", "Transplanter", "Sprayer", "Plough", "Seeder",
    "Irrigation", "Thresher", "Cultivator", "Trailer", "Generator", "Other"
  ];

  const fuelTypes = ["Diesel", "Petrol", "Electric", "Gas", "None"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "maintenance": return "bg-warning text-warning-foreground";
      case "out-of-service": return "bg-destructive text-destructive-foreground";
      case "sold": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOwnershipColor = (ownership: string) => {
    switch (ownership) {
      case "owned": return "bg-blue-100 text-blue-800";
      case "rented": return "bg-orange-100 text-orange-800";
      case "leased": return "bg-purple-100 text-purple-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getMaintenanceStatus = (equipment: Equipment) => {
    if (!equipment.nextMaintenance) return { status: "unknown", days: 0 };

    const today = new Date();
    const daysUntilMaintenance = Math.ceil((equipment.nextMaintenance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilMaintenance < 0) return { status: "overdue", days: Math.abs(daysUntilMaintenance) };
    if (daysUntilMaintenance <= 7) return { status: "due-soon", days: daysUntilMaintenance };
    return { status: "ok", days: daysUntilMaintenance };
  };

  const handleAddEquipment = () => {
    if (newEquipment.name && newEquipment.type && newEquipment.purchaseDate) {
      const equipmentItem: Equipment = {
        id: Date.now().toString(),
        name: newEquipment.name,
        type: newEquipment.type,
        model: newEquipment.model || "",
        purchaseDate: newEquipment.purchaseDate,
        purchasePrice: newEquipment.purchasePrice || 0,
        currentValue: newEquipment.currentValue || newEquipment.purchasePrice || 0,
        ownership: newEquipment.ownership as Equipment['ownership'] || "owned",
        status: newEquipment.status as Equipment['status'] || "active",
        location: newEquipment.location || "",
        fuelType: newEquipment.fuelType,
        fuelEfficiency: newEquipment.fuelEfficiency,
        maintenanceInterval: newEquipment.maintenanceInterval || 90,
        usageHours: newEquipment.usageHours || 0,
        notes: newEquipment.notes
      };
      setEquipment([...equipment, equipmentItem]);
      setNewEquipment({
        name: "",
        type: "",
        model: "",
        purchaseDate: new Date(),
        purchasePrice: 0,
        currentValue: 0,
        ownership: "owned",
        status: "active",
        location: "",
        fuelType: "",
        fuelEfficiency: 0,
        maintenanceInterval: 90,
        usageHours: 0,
        notes: ""
      });
      setIsEquipmentDialogOpen(false);
    }
  };

  const handleEditEquipment = (equipmentItem: Equipment) => {
    setEditingEquipment(equipmentItem);
    setNewEquipment({ ...equipmentItem });
  };

  const handleUpdateEquipment = () => {
    if (editingEquipment && newEquipment.name && newEquipment.type) {
      setEquipment(equipment.map(eq =>
        eq.id === editingEquipment.id
          ? { ...eq, ...newEquipment, ownership: newEquipment.ownership as Equipment['ownership'], status: newEquipment.status as Equipment['status'] }
          : eq
      ));
      setEditingEquipment(null);
      setNewEquipment({
        name: "",
        type: "",
        model: "",
        purchaseDate: new Date(),
        purchasePrice: 0,
        currentValue: 0,
        ownership: "owned",
        status: "active",
        location: "",
        fuelType: "",
        fuelEfficiency: 0,
        maintenanceInterval: 90,
        usageHours: 0,
        notes: ""
      });
    }
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    setEquipment(equipment.filter(eq => eq.id !== equipmentId));
    setMaintenanceRecords(maintenanceRecords.filter(record => record.equipmentId !== equipmentId));
  };

  const handleAddMaintenance = () => {
    if (newMaintenance.equipmentId && newMaintenance.description && newMaintenance.date) {
      const equipmentItem = equipment.find(eq => eq.id === newMaintenance.equipmentId);
      const record: MaintenanceRecord = {
        id: Date.now().toString(),
        equipmentId: newMaintenance.equipmentId,
        equipmentName: equipmentItem?.name || "",
        date: newMaintenance.date,
        type: newMaintenance.type as MaintenanceRecord['type'] || "routine",
        description: newMaintenance.description,
        cost: newMaintenance.cost || 0,
        performedBy: newMaintenance.performedBy || "",
        nextDueDate: newMaintenance.nextDueDate,
        notes: newMaintenance.notes
      };
      setMaintenanceRecords([...maintenanceRecords, record]);

      // Update equipment's last maintenance date
      if (equipmentItem) {
        setEquipment(equipment.map(eq =>
          eq.id === equipmentItem.id
            ? {
                ...eq,
                lastMaintenance: newMaintenance.date,
                nextMaintenance: newMaintenance.nextDueDate || new Date(newMaintenance.date.getTime() + eq.maintenanceInterval * 24 * 60 * 60 * 1000)
              }
            : eq
        ));
      }

      setNewMaintenance({
        equipmentId: "",
        equipmentName: "",
        date: new Date(),
        type: "routine",
        description: "",
        cost: 0,
        performedBy: "",
        notes: ""
      });
      setIsMaintenanceDialogOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalEquipmentValue = equipment
    .filter(eq => eq.status !== 'sold')
    .reduce((sum, eq) => sum + eq.currentValue, 0);

  const maintenanceDueSoon = equipment.filter(eq => {
    const status = getMaintenanceStatus(eq);
    return status.status === 'due-soon' || status.status === 'overdue';
  }).length;

  const equipmentInMaintenance = equipment.filter(eq => eq.status === 'maintenance').length;

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Equipment Management
          </CardTitle>
          <div className="flex gap-2">
            <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Equipment</DialogTitle>
                  <DialogDescription>Add new farm equipment to your inventory.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipment-name">Equipment Name</Label>
                      <Input
                        id="equipment-name"
                        value={newEquipment.name}
                        onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                        placeholder="e.g., Mahindra Tractor"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-type">Type</Label>
                      <Select value={newEquipment.type} onValueChange={(value) => setNewEquipment({ ...newEquipment, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipmentTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipment-model">Model</Label>
                      <Input
                        id="equipment-model"
                        value={newEquipment.model}
                        onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                        placeholder="e.g., 575 DI"
                      />
                    </div>
                    <div>
                      <Label htmlFor="equipment-location">Location</Label>
                      <Input
                        id="equipment-location"
                        value={newEquipment.location}
                        onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                        placeholder="e.g., North Field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="ownership">Ownership</Label>
                      <Select value={newEquipment.ownership} onValueChange={(value) => setNewEquipment({ ...newEquipment, ownership: value as Equipment['ownership'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owned">Owned</SelectItem>
                          <SelectItem value="rented">Rented</SelectItem>
                          <SelectItem value="leased">Leased</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="equipment-status">Status</Label>
                      <Select value={newEquipment.status} onValueChange={(value) => setNewEquipment({ ...newEquipment, status: value as Equipment['status'] })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="out-of-service">Out of Service</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maintenance-interval">Maintenance Interval (days)</Label>
                      <Input
                        id="maintenance-interval"
                        type="number"
                        value={newEquipment.maintenanceInterval}
                        onChange={(e) => setNewEquipment({ ...newEquipment, maintenanceInterval: parseInt(e.target.value) || 90 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchase-date">Purchase Date</Label>
                      <Input
                        id="purchase-date"
                        type="date"
                        value={newEquipment.purchaseDate?.toISOString().split('T')[0]}
                        onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: new Date(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="usage-hours">Usage Hours</Label>
                      <Input
                        id="usage-hours"
                        type="number"
                        value={newEquipment.usageHours}
                        onChange={(e) => setNewEquipment({ ...newEquipment, usageHours: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchase-price">Purchase Price (₹)</Label>
                      <Input
                        id="purchase-price"
                        type="number"
                        value={newEquipment.purchasePrice}
                        onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="current-value">Current Value (₹)</Label>
                      <Input
                        id="current-value"
                        type="number"
                        value={newEquipment.currentValue}
                        onChange={(e) => setNewEquipment({ ...newEquipment, currentValue: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  {(newEquipment.type === 'Tractor' || newEquipment.type === 'Harvester' || newEquipment.type === 'Transplanter') && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fuel-type">Fuel Type</Label>
                        <Select value={newEquipment.fuelType} onValueChange={(value) => setNewEquipment({ ...newEquipment, fuelType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fuel type" />
                          </SelectTrigger>
                          <SelectContent>
                            {fuelTypes.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="fuel-efficiency">Fuel Efficiency (km/L)</Label>
                        <Input
                          id="fuel-efficiency"
                          type="number"
                          step="0.1"
                          value={newEquipment.fuelEfficiency}
                          onChange={(e) => setNewEquipment({ ...newEquipment, fuelEfficiency: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="equipment-notes">Notes</Label>
                    <Textarea
                      id="equipment-notes"
                      value={newEquipment.notes}
                      onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                      placeholder="Additional notes about the equipment"
                    />
                  </div>

                  <Button onClick={handleAddEquipment} className="w-full">
                    Add Equipment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Add Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Maintenance Record</DialogTitle>
                  <DialogDescription>Log maintenance activities for your equipment.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="maintenance-equipment">Equipment</Label>
                    <Select value={newMaintenance.equipmentId} onValueChange={(value) => {
                      const equipmentItem = equipment.find(eq => eq.id === value);
                      setNewMaintenance({
                        ...newMaintenance,
                        equipmentId: value,
                        equipmentName: equipmentItem?.name || ""
                      });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map(eq => (
                          <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maintenance-type">Type</Label>
                    <Select value={newMaintenance.type} onValueChange={(value) => setNewMaintenance({ ...newMaintenance, type: value as MaintenanceRecord['type'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maintenance-date">Date</Label>
                    <Input
                      id="maintenance-date"
                      type="date"
                      value={newMaintenance.date?.toISOString().split('T')[0]}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, date: new Date(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenance-description">Description</Label>
                    <Textarea
                      id="maintenance-description"
                      value={newMaintenance.description}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                      placeholder="Describe the maintenance work"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maintenance-cost">Cost (₹)</Label>
                    <Input
                      id="maintenance-cost"
                      type="number"
                      value={newMaintenance.cost}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="performed-by">Performed By</Label>
                    <Input
                      id="performed-by"
                      value={newMaintenance.performedBy}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, performedBy: e.target.value })}
                      placeholder="Workshop or technician name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="next-due">Next Due Date (optional)</Label>
                    <Input
                      id="next-due"
                      type="date"
                      value={newMaintenance.nextDueDate?.toISOString().split('T')[0]}
                      onChange={(e) => setNewMaintenance({ ...newMaintenance, nextDueDate: e.target.value ? new Date(e.target.value) : undefined })}
                    />
                  </div>
                  <Button onClick={handleAddMaintenance} className="w-full">
                    Add Maintenance Record
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="equipment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="equipment" className="space-y-4">
            {/* Equipment Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{equipment.length}</div>
                  <div className="text-sm text-muted-foreground">Total Equipment</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-success">{formatCurrency(totalEquipmentValue)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-warning">{maintenanceDueSoon}</div>
                  <div className="text-sm text-muted-foreground">Maintenance Due</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{equipmentInMaintenance}</div>
                  <div className="text-sm text-muted-foreground">In Maintenance</div>
                </CardContent>
              </Card>
            </div>

            {/* Equipment List */}
            <div className="space-y-4">
              {equipment.map((eq) => {
                const maintenanceStatus = getMaintenanceStatus(eq);
                return (
                  <Card key={eq.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Settings className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{eq.name}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{eq.type}</span>
                              {eq.model && <span>• {eq.model}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(eq.status)}>
                            {eq.status}
                          </Badge>
                          <Badge className={getOwnershipColor(eq.ownership)}>
                            {eq.ownership}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEquipment(eq)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEquipment(eq.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Location:</span>
                          <span className="ml-2">{eq.location}</span>
                        </div>
                        <div>
                          <span className="font-medium">Purchase:</span>
                          <span className="ml-2">{formatCurrency(eq.purchasePrice)} ({eq.purchaseDate.getFullYear()})</span>
                        </div>
                        <div>
                          <span className="font-medium">Current Value:</span>
                          <span className="ml-2">{formatCurrency(eq.currentValue)}</span>
                        </div>
                      </div>

                      {eq.fuelType && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Fuel:</span>
                          <span className="ml-2">{eq.fuelType}</span>
                          {eq.fuelEfficiency && (
                            <span className="ml-2">({eq.fuelEfficiency} km/L)</span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">Maintenance Status</span>
                          <Badge variant={
                            maintenanceStatus.status === 'overdue' ? 'destructive' :
                            maintenanceStatus.status === 'due-soon' ? 'secondary' : 'outline'
                          }>
                            {maintenanceStatus.status === 'overdue' ? 'Overdue' :
                             maintenanceStatus.status === 'due-soon' ? 'Due Soon' : 'OK'}
                          </Badge>
                        </div>
                        {eq.nextMaintenance && (
                          <div className="text-xs text-muted-foreground">
                            Next maintenance: {eq.nextMaintenance.toLocaleDateString()}
                            {maintenanceStatus.days > 0 && ` (${maintenanceStatus.days} days)`}
                          </div>
                        )}
                      </div>

                      {eq.notes && (
                        <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
                          {eq.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="space-y-4">
              {maintenanceRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{record.equipmentName}</h4>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(record.cost)}</div>
                        <div className="text-sm text-muted-foreground">{record.date.toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{record.type}</Badge>
                        <span>By: {record.performedBy}</span>
                      </div>
                      {record.nextDueDate && (
                        <div className="text-muted-foreground">
                          Next due: {record.nextDueDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-sm">
                        {record.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Equipment by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Equipment by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {equipmentTypes.slice(0, 6).map(type => {
                    const count = equipment.filter(eq => eq.type === type).length;
                    const percentage = equipment.length > 0 ? (count / equipment.length) * 100 : 0;
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Settings className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{type}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Maintenance Costs */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Costs (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Maintenance cost analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Equipment Dialog */}
        <Dialog open={!!editingEquipment} onOpenChange={() => setEditingEquipment(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Equipment</DialogTitle>
              <DialogDescription>Update equipment details and information.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-equipment-name">Equipment Name</Label>
                  <Input
                    id="edit-equipment-name"
                    value={newEquipment.name}
                    onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-equipment-type">Type</Label>
                  <Select value={newEquipment.type} onValueChange={(value) => setNewEquipment({ ...newEquipment, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {equipmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-equipment-model">Model</Label>
                  <Input
                    id="edit-equipment-model"
                    value={newEquipment.model}
                    onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-equipment-location">Location</Label>
                  <Input
                    id="edit-equipment-location"
                    value={newEquipment.location}
                    onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-ownership">Ownership</Label>
                  <Select value={newEquipment.ownership} onValueChange={(value) => setNewEquipment({ ...newEquipment, ownership: value as Equipment['ownership'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owned">Owned</SelectItem>
                      <SelectItem value="rented">Rented</SelectItem>
                      <SelectItem value="leased">Leased</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-equipment-status">Status</Label>
                  <Select value={newEquipment.status} onValueChange={(value) => setNewEquipment({ ...newEquipment, status: value as Equipment['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="out-of-service">Out of Service</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-maintenance-interval">Maintenance Interval (days)</Label>
                  <Input
                    id="edit-maintenance-interval"
                    type="number"
                    value={newEquipment.maintenanceInterval}
                    onChange={(e) => setNewEquipment({ ...newEquipment, maintenanceInterval: parseInt(e.target.value) || 90 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-purchase-price">Purchase Price (₹)</Label>
                  <Input
                    id="edit-purchase-price"
                    type="number"
                    value={newEquipment.purchasePrice}
                    onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-current-value">Current Value (₹)</Label>
                  <Input
                    id="edit-current-value"
                    type="number"
                    value={newEquipment.currentValue}
                    onChange={(e) => setNewEquipment({ ...newEquipment, currentValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-equipment-notes">Notes</Label>
                <Textarea
                  id="edit-equipment-notes"
                  value={newEquipment.notes}
                  onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                />
              </div>

              <Button onClick={handleUpdateEquipment} className="w-full">
                Update Equipment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}