"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Car,
  X,
  Plus,
} from "lucide-react";
import { Vehicle, NewVehicleFormData } from "../types";

interface Step2Props {
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  vehiclePlateSearch: string;
  setVehiclePlateSearch: (search: string) => void;
  isSearchingVehicle: boolean;
  hasSearchedVehicle: boolean;
  setHasSearchedVehicle: (searched: boolean) => void;
  searchVehicleByPlate: () => void;
  showVehicleRegisterForm: boolean;
  setShowVehicleRegisterForm: (show: boolean) => void;
  newVehicleData: NewVehicleFormData;
  setNewVehicleData: (
    data:
      | NewVehicleFormData
      | ((prev: NewVehicleFormData) => NewVehicleFormData)
  ) => void;
  isCreatingVehicle: boolean;
  handleCreateVehicle: (e: React.FormEvent) => void;
}

export default function Step2({
  selectedVehicle,
  setSelectedVehicle,
  vehiclePlateSearch,
  setVehiclePlateSearch,
  isSearchingVehicle,
  hasSearchedVehicle,
  setHasSearchedVehicle,
  searchVehicleByPlate,
  showVehicleRegisterForm,
  setShowVehicleRegisterForm,
  newVehicleData,
  setNewVehicleData,
  isCreatingVehicle,
  handleCreateVehicle,
}: Step2Props) {
  const getOwnerFullName = (vehicle: Vehicle) => {
    const nameParts = [
      vehicle.ownerFirstName,
      vehicle.ownerMiddleName,
      vehicle.ownerLastName,
    ].filter(Boolean);
    return nameParts.length > 0 ? nameParts.join(" ") : "Unknown Owner";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Vehicle Information</CardTitle>
        <CardDescription>
          Search for an existing vehicle or register a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Vehicle Display */}
        {selectedVehicle && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Vehicle Selected</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <p className="font-semibold text-lg">
                      {selectedVehicle.plateNo}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: {selectedVehicle.vehicleType}
                    </p>
                  </div>
                  <div className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVehicle(null);
                        setVehiclePlateSearch("");
                        setHasSearchedVehicle(false);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Change
                    </Button>
                  </div>
                </div>
                <Separator className="my-2" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedVehicle.make && (
                    <p>
                      <span className="font-medium">Make:</span>{" "}
                      {selectedVehicle.make}
                    </p>
                  )}
                  {selectedVehicle.vehicleModel && (
                    <p>
                      <span className="font-medium">Model:</span>{" "}
                      {selectedVehicle.vehicleModel}
                    </p>
                  )}
                  {selectedVehicle.color && (
                    <p>
                      <span className="font-medium">Color:</span>{" "}
                      {selectedVehicle.color}
                    </p>
                  )}
                  {selectedVehicle.year && (
                    <p>
                      <span className="font-medium">Year:</span>{" "}
                      {selectedVehicle.year}
                    </p>
                  )}
                </div>
                {(selectedVehicle.ownerFirstName ||
                  selectedVehicle.ownerLastName) && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-sm">
                      <span className="font-medium">Registered Owner:</span>{" "}
                      {getOwnerFullName(selectedVehicle)}
                    </p>
                  </>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Vehicle Search Section */}
        {!selectedVehicle && !showVehicleRegisterForm && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by plate number (e.g., ABC1234)..."
                value={vehiclePlateSearch}
                onChange={(e) =>
                  setVehiclePlateSearch(e.target.value.toUpperCase())
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchVehicleByPlate();
                  }
                }}
              />
              <Button
                type="button"
                onClick={searchVehicleByPlate}
                disabled={isSearchingVehicle}
              >
                {isSearchingVehicle ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* No Vehicle Found */}
            {hasSearchedVehicle && !selectedVehicle && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Vehicle not found</AlertTitle>
                <AlertDescription>
                  No vehicle found with plate number &quot;{vehiclePlateSearch}
                  &quot;. You can create it below.
                </AlertDescription>
              </Alert>
            )}

            <Separator />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowVehicleRegisterForm(true);
                // Pre-fill plate number if searched
                if (vehiclePlateSearch) {
                  setNewVehicleData((prev) => ({
                    ...prev,
                    plateNo: vehiclePlateSearch.toUpperCase(),
                  }));
                }
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Register New Vehicle
            </Button>
          </div>
        )}

        {/* Create New Vehicle Form */}
        {!selectedVehicle && showVehicleRegisterForm && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Create New Vehicle</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowVehicleRegisterForm(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Information */}
              <div className="space-y-2 md:col-span-2">
                <h4 className="font-semibold text-sm">Vehicle Details</h4>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPlateNo">Plate Number *</Label>
                <Input
                  id="newPlateNo"
                  value={newVehicleData.plateNo}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      plateNo: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="ABC1234"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newVehicleType">Vehicle Type *</Label>
                <Select
                  value={newVehicleData.vehicleType}
                  onValueChange={(
                    value: "PRIVATE" | "FOR_HIRE" | "GOVERNMENT" | "DIPLOMATIC"
                  ) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      vehicleType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                    <SelectItem value="FOR_HIRE">For Hire</SelectItem>
                    <SelectItem value="GOVERNMENT">Government</SelectItem>
                    <SelectItem value="DIPLOMATIC">Diplomatic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newMake">Make</Label>
                <Input
                  id="newMake"
                  value={newVehicleData.make}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      make: e.target.value,
                    })
                  }
                  placeholder="Toyota"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newModel">Model</Label>
                <Input
                  id="newModel"
                  value={newVehicleData.vehicleModel}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      vehicleModel: e.target.value,
                    })
                  }
                  placeholder="Vios"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newYear">Year</Label>
                <Input
                  id="newYear"
                  type="number"
                  value={newVehicleData.year || ""}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      year: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newColor">Color</Label>
                <Input
                  id="newColor"
                  value={newVehicleData.color}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      color: e.target.value,
                    })
                  }
                  placeholder="White"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newClassification">Classification</Label>
                <Input
                  id="newClassification"
                  value={newVehicleData.classification}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      classification: e.target.value,
                    })
                  }
                  placeholder="Sedan, SUV, Motorcycle, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newBodyMark">Body Mark</Label>
                <Input
                  id="newBodyMark"
                  value={newVehicleData.bodyMark}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      bodyMark: e.target.value,
                    })
                  }
                  placeholder="e.g., dent on left door"
                />
              </div>

              {/* Vehicle Owner Information */}
              <div className="space-y-2 md:col-span-2">
                <Separator className="my-4" />
                <h4 className="font-semibold text-sm">
                  Vehicle Owner Information
                </h4>
                <p className="text-xs text-muted-foreground">
                  Enter the vehicle owner&apos;s full name (optional if unknown)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerFirstName">Owner First Name</Label>
                <Input
                  id="ownerFirstName"
                  value={newVehicleData.ownerFirstName || ""}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      ownerFirstName: e.target.value,
                    })
                  }
                  placeholder="Juan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerMiddleName">Owner Middle Name</Label>
                <Input
                  id="ownerMiddleName"
                  value={newVehicleData.ownerMiddleName || ""}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      ownerMiddleName: e.target.value,
                    })
                  }
                  placeholder="Reyes"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerLastName">Owner Last Name</Label>
                <Input
                  id="ownerLastName"
                  value={newVehicleData.ownerLastName || ""}
                  onChange={(e) =>
                    setNewVehicleData({
                      ...newVehicleData,
                      ownerLastName: e.target.value,
                    })
                  }
                  placeholder="Dela Cruz"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={handleCreateVehicle}
                disabled={isCreatingVehicle}
                className="flex-1"
              >
                {isCreatingVehicle ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Car className="w-4 h-4 mr-2" />
                    Register Vehicle
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
