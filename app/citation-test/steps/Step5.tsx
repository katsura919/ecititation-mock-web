"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Car, MapPin, ClipboardCheck } from "lucide-react";
import { format } from "date-fns";
import { Driver, Violation, CitationFormData } from "../types";

interface Step5Props {
  selectedDriver: Driver | null;
  citationData: CitationFormData;
  selectedViolations: string[];
  violations: Violation[];
  calculateTotalFine: () => number;
}

export default function Step5({
  selectedDriver,
  citationData,
  selectedViolations,
  violations,
  calculateTotalFine,
}: Step5Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Review & Submit</CardTitle>
        <CardDescription>
          Review all information before submitting
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Driver Info */}
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <User className="w-5 h-5" />
            Driver Information
          </h3>
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <p>
              <span className="font-medium">Name:</span>{" "}
              {selectedDriver?.firstName} {selectedDriver?.middleName}{" "}
              {selectedDriver?.lastName}
            </p>
            <p>
              <span className="font-medium">License No:</span>{" "}
              {selectedDriver?.licenseNo}
            </p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              {selectedDriver?.email}
            </p>
            <p>
              <span className="font-medium">Contact:</span>{" "}
              {selectedDriver?.contactNo}
            </p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Information
          </h3>
          <div className="bg-muted p-4 rounded-lg space-y-1">
            <p>
              <span className="font-medium">Plate No:</span>{" "}
              {citationData.vehicleInfo.plateNo}
            </p>
            <p>
              <span className="font-medium">Type:</span>{" "}
              {citationData.vehicleInfo.vehicleType}
            </p>
            {citationData.vehicleInfo.make && (
              <p>
                <span className="font-medium">Make:</span>{" "}
                {citationData.vehicleInfo.make}
              </p>
            )}
            {citationData.vehicleInfo.model && (
              <p>
                <span className="font-medium">Model:</span>{" "}
                {citationData.vehicleInfo.model}
              </p>
            )}
            {citationData.vehicleInfo.color && (
              <p>
                <span className="font-medium">Color:</span>{" "}
                {citationData.vehicleInfo.color}
              </p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </h3>
          <div className="bg-muted p-4 rounded-lg space-y-1">
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
            <p>
              <span className="font-medium">Date & Time:</span>{" "}
              {format(citationData.violationDateTime, "PPP p")}
            </p>
          </div>
        </div>

        {/* Violations */}
        <div>
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Violations ({selectedViolations.length})
          </h3>
          <div className="space-y-2">
            {selectedViolations.map((violationId) => {
              const violation = violations.find((v) => v._id === violationId);
              if (!violation) return null;

              let fineAmount = 0;
              if (violation.fineStructure === "FIXED" && violation.fixedFine) {
                fineAmount =
                  citationData.vehicleInfo.vehicleType === "PRIVATE"
                    ? violation.fixedFine.private.driver
                    : violation.fixedFine.forHire.driver;
              } else if (
                violation.fineStructure === "PROGRESSIVE" &&
                violation.progressiveFine
              ) {
                fineAmount =
                  citationData.vehicleInfo.vehicleType === "PRIVATE"
                    ? violation.progressiveFine.private.driver.firstOffense
                    : violation.progressiveFine.forHire.driver.firstOffense;
              }

              return (
                <div key={violationId} className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{violation.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {violation.code}
                      </p>
                    </div>
                    <p className="font-bold">₱{fineAmount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Fine:</span>
              <span className="text-2xl text-blue-600">
                ₱{calculateTotalFine().toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {citationData.notes && (
          <div>
            <h3 className="font-semibold text-lg mb-2">Additional Notes</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p>{citationData.notes}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
