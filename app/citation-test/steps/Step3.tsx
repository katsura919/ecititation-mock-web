"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { CitationFormData } from "../types";

interface Step3Props {
  citationData: CitationFormData;
  setCitationData: (data: CitationFormData) => void;
}

export default function Step3({ citationData, setCitationData }: Step3Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: Violation Location</CardTitle>
        <CardDescription>Where did the violation occur?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street/Road</Label>
            <Input
              id="street"
              value={citationData.location.street}
              onChange={(e) =>
                setCitationData({
                  ...citationData,
                  location: {
                    ...citationData.location,
                    street: e.target.value,
                  },
                })
              }
              placeholder="EDSA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="barangay">Barangay *</Label>
            <Input
              id="barangay"
              value={citationData.location.barangay}
              onChange={(e) =>
                setCitationData({
                  ...citationData,
                  location: {
                    ...citationData.location,
                    barangay: e.target.value,
                  },
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={citationData.location.city}
              onChange={(e) =>
                setCitationData({
                  ...citationData,
                  location: {
                    ...citationData.location,
                    city: e.target.value,
                  },
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="province">Province *</Label>
            <Input
              id="province"
              value={citationData.location.province}
              onChange={(e) =>
                setCitationData({
                  ...citationData,
                  location: {
                    ...citationData.location,
                    province: e.target.value,
                  },
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Violation Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {citationData.violationDateTime ? (
                    format(citationData.violationDateTime, "PPP p")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={citationData.violationDateTime}
                  onSelect={(date) =>
                    date &&
                    setCitationData({
                      ...citationData,
                      violationDateTime: date,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={citationData.notes}
            onChange={(e) =>
              setCitationData({ ...citationData, notes: e.target.value })
            }
            rows={3}
            placeholder="Any additional information about the violation..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
