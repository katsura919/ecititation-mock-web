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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { Driver, NewDriverFormData, SubmitStatus } from "../types";

interface Step1Props {
  selectedDriver: Driver | null;
  setSelectedDriver: (driver: Driver | null) => void;
  driverSearchQuery: string;
  setDriverSearchQuery: (query: string) => void;
  searchResults: Driver[];
  isSearching: boolean;
  hasSearched: boolean;
  searchDrivers: () => void;
  showRegisterForm: boolean;
  setShowRegisterForm: (show: boolean) => void;
  newDriverData: NewDriverFormData;
  setNewDriverData: (data: NewDriverFormData) => void;
  isRegistering: boolean;
  handleSelectDriver: (driver: Driver) => void;
  handleRegisterDriver: (e: React.FormEvent) => void;
}

export default function Step1({
  selectedDriver,
  setSelectedDriver,
  driverSearchQuery,
  setDriverSearchQuery,
  searchResults,
  isSearching,
  hasSearched,
  searchDrivers,
  showRegisterForm,
  setShowRegisterForm,
  newDriverData,
  setNewDriverData,
  isRegistering,
  handleSelectDriver,
  handleRegisterDriver,
}: Step1Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Select or Register Driver</CardTitle>
        <CardDescription>
          Search for an existing driver or register a new one
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selected Driver Display */}
        {selectedDriver && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle>Driver Selected</AlertTitle>
            <AlertDescription className="mt-2">
              <div className="space-y-1">
                <p className="font-semibold">
                  {selectedDriver.firstName} {selectedDriver.middleName}{" "}
                  {selectedDriver.lastName}
                </p>
                <p className="text-sm">
                  License No: {selectedDriver.licenseNo}
                </p>
                <p className="text-sm">Email: {selectedDriver.email}</p>
                <p className="text-sm">Contact: {selectedDriver.contactNo}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedDriver(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Change Driver
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Search Section */}
        {!selectedDriver && !showRegisterForm && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or license number..."
                value={driverSearchQuery}
                onChange={(e) => setDriverSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    searchDrivers();
                  }
                }}
              />
              <Button
                type="button"
                onClick={searchDrivers}
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div className="space-y-2">
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Found {searchResults.length} driver(s)
                    </p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map((driver) => (
                        <Card
                          key={driver._id}
                          className="cursor-pointer hover:border-blue-500 transition-colors"
                          onClick={() => handleSelectDriver(driver)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">
                                  {driver.firstName} {driver.middleName}{" "}
                                  {driver.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  License: {driver.licenseNo}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {driver.email}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  driver.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {driver.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No drivers found</AlertTitle>
                    <AlertDescription>
                      No drivers match your search criteria. You can register a
                      new driver below.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Separator />

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowRegisterForm(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register New Driver
            </Button>
          </div>
        )}

        {/* Register New Driver Form */}
        {!selectedDriver && showRegisterForm && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Register New Driver</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowRegisterForm(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNo">License Number</Label>
                  <Input
                    id="licenseNo"
                    value={newDriverData.licenseNo}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        licenseNo: e.target.value,
                      })
                    }
                    placeholder="N01-12-345678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newDriverData.firstName}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        firstName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={newDriverData.middleName}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        middleName: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newDriverData.lastName}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        lastName: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newDriverData.email}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNo">
                    Contact Number * (11 digits)
                  </Label>
                  <Input
                    id="contactNo"
                    value={newDriverData.contactNo}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        contactNo: e.target.value,
                      })
                    }
                    placeholder="09171234567"
                    maxLength={11}
                    pattern="[0-9]{11}"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={newDriverData.birthDate}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        birthDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sex">Sex *</Label>
                  <Select
                    value={newDriverData.sex}
                    onValueChange={(value: "MALE" | "FEMALE") =>
                      setNewDriverData({ ...newDriverData, sex: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={newDriverData.nationality}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        nationality: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={newDriverData.weight || ""}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        weight: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height">Height (meters)</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.01"
                    value={newDriverData.height || ""}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        height: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="1.70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select
                    value={newDriverData.bloodType || ""}
                    onValueChange={(value) =>
                      setNewDriverData({
                        ...newDriverData,
                        bloodType: value || undefined,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agencyCode">Agency Code</Label>
                  <Input
                    id="agencyCode"
                    value={newDriverData.agencyCode || ""}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        agencyCode: e.target.value || undefined,
                      })
                    }
                    placeholder="LTO"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eyesColor">Eye Color</Label>
                  <Input
                    id="eyesColor"
                    value={newDriverData.eyesColor || ""}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        eyesColor: e.target.value || undefined,
                      })
                    }
                    placeholder="Brown"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dlCodes">DL Restriction Codes</Label>
                  <Input
                    id="dlCodes"
                    value={newDriverData.dlCodes?.join(", ") || ""}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        dlCodes: e.target.value
                          ? e.target.value.split(",").map((code) => code.trim())
                          : [],
                      })
                    }
                    placeholder="1, 2, 3"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter restriction codes separated by commas (e.g., 1, 2, 3)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expirationDate">
                    License Expiration Date *
                  </Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={newDriverData.expirationDate}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        expirationDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Street *</Label>
                  <Input
                    id="street"
                    value={newDriverData.address.street}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        address: {
                          ...newDriverData.address,
                          street: e.target.value,
                        },
                      })
                    }
                    placeholder="123 Rizal Street"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay *</Label>
                  <Input
                    id="barangay"
                    value={newDriverData.address.barangay}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        address: {
                          ...newDriverData.address,
                          barangay: e.target.value,
                        },
                      })
                    }
                    placeholder="Barangay San Jose"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressCity">City *</Label>
                  <Input
                    id="addressCity"
                    value={newDriverData.address.city}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        address: {
                          ...newDriverData.address,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="Manila"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="addressProvince">Province *</Label>
                  <Input
                    id="addressProvince"
                    value={newDriverData.address.province}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        address: {
                          ...newDriverData.address,
                          province: e.target.value,
                        },
                      })
                    }
                    placeholder="Metro Manila"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={newDriverData.address.postalCode}
                    onChange={(e) =>
                      setNewDriverData({
                        ...newDriverData,
                        address: {
                          ...newDriverData.address,
                          postalCode: e.target.value,
                        },
                      })
                    }
                    placeholder="1000"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleRegisterDriver}
                disabled={isRegistering}
                className="w-full"
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register Driver
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
