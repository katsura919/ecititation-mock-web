"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Car, MapPin, ClipboardCheck, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Driver, Vehicle, Violation, CitationFormData } from "../types";

interface Step5Props {
  selectedDriver: Driver | null;
  selectedVehicle: Vehicle | null;
  citationData: CitationFormData;
  selectedViolations: string[];
  violations: Violation[];
  calculateTotalFine: () => number;
}

export default function Step5({
  selectedDriver,
  selectedVehicle,
  citationData,
  selectedViolations,
  violations,
  calculateTotalFine,
}: Step5Props) {
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
        <CardTitle>Step 5: Review & Submit</CardTitle>
        <CardDescription>
          Review all information before submitting the citation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Driver Info */}
        <Card className="border-blue-200 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
              <div>
                <p className="text-muted-foreground">Full Name:</p>
                <p className="font-semibold">
                  {selectedDriver?.firstName}{" "}
                  {selectedDriver?.middleName && `${selectedDriver.middleName} `}
                  {selectedDriver?.lastName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">License No:</p>
                <p className="font-semibold font-mono">
                  {selectedDriver?.licenseNo || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Email:</p>
                <p className="font-semibold">{selectedDriver?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact:</p>
                <p className="font-semibold">{selectedDriver?.contactNo}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Info */}
        <Card className="border-green-200 bg-green-50/30 dark:bg-green-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="w-5 h-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-muted-foreground text-sm">Plate Number:</p>
                  <p className="font-bold text-2xl font-mono">
                    {selectedVehicle?.plateNo}
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {selectedVehicle?.vehicleType}
                </Badge>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                {selectedVehicle?.make && (
                  <div>
                    <p className="text-muted-foreground">Make:</p>
                    <p className="font-semibold">{selectedVehicle.make}</p>
                  </div>
                )}
                {selectedVehicle?.vehicleModel && (
                  <div>
                    <p className="text-muted-foreground">Model:</p>
                    <p className="font-semibold">{selectedVehicle.vehicleModel}</p>
                  </div>
                )}
                {selectedVehicle?.color && (
                  <div>
                    <p className="text-muted-foreground">Color:</p>
                    <p className="font-semibold">{selectedVehicle.color}</p>
                  </div>
                )}
                {selectedVehicle?.year && (
                  <div>
                    <p className="text-muted-foreground">Year:</p>
                    <p className="font-semibold">{selectedVehicle.year}</p>
                  </div>
                )}
              </div>
              {selectedVehicle &&
                (selectedVehicle.ownerFirstName ||
                  selectedVehicle.ownerLastName) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Registered Owner:
                      </p>
                      <p className="font-semibold">
                        {getOwnerFullName(selectedVehicle)}
                      </p>
                    </div>
                  </>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Violation Location & Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {citationData.location.street && (
                <p>
                  <span className="font-medium">Street:</span>{" "}
                  {citationData.location.street}
                </p>
              )}
              <p>
                <span className="font-medium">Barangay:</span>{" "}
                {citationData.location.barangay}
              </p>
              <p>
                <span className="font-medium">City:</span>{" "}
                {citationData.location.city}
              </p>
              <p>
                <span className="font-medium">Province:</span>{" "}
                {citationData.location.province}
              </p>
              <Separator className="my-2" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    Violation Date & Time:
                  </p>
                  <p className="font-semibold">
                    {format(citationData.violationDateTime, "PPP 'at' p")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violations */}
        <Card className="border-red-200 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Violations ({selectedViolations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedViolations.map((violationId) => {
                const violation = violations.find((v) => v._id === violationId);
                if (!violation) return null;

                let fineAmount = 0;
                if (selectedVehicle) {
                  if (violation.fineStructure === "FIXED" && violation.fixedFine) {
                    fineAmount =
                      selectedVehicle.vehicleType === "PRIVATE"
                        ? violation.fixedFine.private.driver
                        : selectedVehicle.vehicleType === "FOR_HIRE"
                        ? violation.fixedFine.forHire.driver
                        : 0;
                  } else if (
                    violation.fineStructure === "PROGRESSIVE" &&
                    violation.progressiveFine
                  ) {
                    fineAmount =
                      selectedVehicle.vehicleType === "PRIVATE"
                        ? violation.progressiveFine.private.driver.firstOffense
                        : selectedVehicle.vehicleType === "FOR_HIRE"
                        ? violation.progressiveFine.forHire.driver.firstOffense
                        : 0;
                  }
                }

                return (
                  <Card key={violationId} className="bg-background">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {violation.title}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {violation.code}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {violation.fineStructure}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-red-600">
                            ₱{fineAmount.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {violation.fineStructure === "PROGRESSIVE"
                              ? "1st Offense"
                              : "Fixed"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Separator className="my-3" />

              <Card className="border-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Total Fine Amount</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {citationData.dueDate
                          ? format(citationData.dueDate, "PPP")
                          : "15 days from issuance"}
                      </p>
                    </div>
                    <p className="text-4xl font-bold text-blue-600">
                      ₱{calculateTotalFine().toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {citationData.notes && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {citationData.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
