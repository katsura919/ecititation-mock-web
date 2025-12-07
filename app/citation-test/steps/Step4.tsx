"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";
import { Violation, Vehicle } from "../types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Step4Props {
  violations: Violation[];
  violationsLoading: boolean;
  selectedViolations: string[];
  handleViolationToggle: (violationId: string) => void;
  selectedVehicle: Vehicle | null;
  calculateTotalFine: () => number;
}

export default function Step4({
  violations,
  violationsLoading,
  selectedViolations,
  handleViolationToggle,
  selectedVehicle,
  calculateTotalFine,
}: Step4Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Select Violations</CardTitle>
        <CardDescription>
          Choose the traffic violations committed
          {selectedViolations.length > 0 && (
            <span className="ml-2 text-blue-600 font-semibold">
              ({selectedViolations.length} selected)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {violationsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {!selectedVehicle && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please select a vehicle first to see accurate fine amounts.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {violations.map((violation) => {
                const isSelected = selectedViolations.includes(violation._id);
                let fineAmount = 0;

                if (selectedVehicle) {
                  if (
                    violation.fineStructure === "FIXED" &&
                    violation.fixedFine
                  ) {
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
                  <Card
                    key={violation._id}
                    className={`transition-all cursor-pointer hover:shadow-md ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                        : "hover:border-gray-400"
                    }`}
                    onClick={() => handleViolationToggle(violation._id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            handleViolationToggle(violation._id)
                          }
                          className="mt-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-base">
                                {violation.title}
                              </p>
                              <div className="flex gap-2 items-center mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {violation.code}
                                </Badge>
                                <Badge
                                  variant={
                                    violation.fineStructure === "FIXED"
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="text-xs"
                                >
                                  {violation.fineStructure}
                                </Badge>
                              </div>
                              <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                                {violation.description}
                              </p>
                              {violation.legalReference && (
                                <p className="text-xs mt-1 text-muted-foreground italic">
                                  {violation.legalReference}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-2xl font-bold text-blue-600">
                                ₱{fineAmount.toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {violation.fineStructure === "PROGRESSIVE"
                                  ? "1st Offense"
                                  : "Fixed Fine"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {selectedViolations.length > 0 && (
          <Card className="border-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Fine Amount
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedViolations.length} violation
                    {selectedViolations.length > 1 ? "s" : ""} selected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">
                    ₱{calculateTotalFine().toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
