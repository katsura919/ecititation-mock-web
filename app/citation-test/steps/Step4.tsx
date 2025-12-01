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
import { Loader2 } from "lucide-react";
import { Violation, CitationFormData } from "../types";

interface Step4Props {
  violations: Violation[];
  violationsLoading: boolean;
  selectedViolations: string[];
  handleViolationToggle: (violationId: string) => void;
  citationData: CitationFormData;
  calculateTotalFine: () => number;
}

export default function Step4({
  violations,
  violationsLoading,
  selectedViolations,
  handleViolationToggle,
  citationData,
  calculateTotalFine,
}: Step4Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Select Violations</CardTitle>
        <CardDescription>
          Choose the traffic violations committed
          {selectedViolations.length > 0 && (
            <span className="ml-2 text-blue-500">
              ({selectedViolations.length} selected)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {violationsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {violations.map((violation) => {
              const isSelected = selectedViolations.includes(violation._id);
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
                <Card
                  key={violation._id}
                  className={`transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                      : "hover:border-gray-400"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          handleViolationToggle(violation._id)
                        }
                        className="mt-1"
                      />
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleViolationToggle(violation._id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{violation.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Code: {violation.code}
                            </p>
                            <p className="text-sm mt-1">
                              {violation.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">
                              {violation.fineStructure}
                            </Badge>
                            <p className="text-lg font-bold mt-1">
                              ₱{fineAmount.toLocaleString()}
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
        )}

        {selectedViolations.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Fine:</span>
              <span className="text-2xl text-blue-600">
                ₱{calculateTotalFine().toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
