"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  User,
  Car,
  MapPin,
  FileText,
  ClipboardCheck,
} from "lucide-react";

// Import types
import {
  Driver,
  Vehicle,
  Violation,
  NewDriverFormData,
  NewVehicleFormData,
  CitationFormData,
  SubmitStatus,
} from "./types";

// Import step components
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import Step5 from "./steps/Step5";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const MOCK_ENFORCER_ID = "69284db9067746a6d0ace561";

const STEPS = [
  {
    id: 1,
    title: "Select Driver",
    icon: User,
    description: "Search or register driver",
  },
  { id: 2, title: "Vehicle Info", icon: Car, description: "Vehicle details" },
  { id: 3, title: "Location", icon: MapPin, description: "Violation location" },
  {
    id: 4,
    title: "Violations",
    icon: ClipboardCheck,
    description: "Select violations",
  },
  { id: 5, title: "Review", icon: FileText, description: "Review & submit" },
];

export default function CitationTestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Driver search
  const [driverSearchQuery, setDriverSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // New driver registration
  const [newDriverData, setNewDriverData] = useState<NewDriverFormData>({
    licenseNo: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    contactNo: "",
    address: {
      street: "",
      barangay: "",
      city: "",
      province: "",
      postalCode: "",
    },
    birthDate: "",
    nationality: "Filipino",
    sex: "MALE",
    expirationDate: "",
    dlCodes: [],
  });
  const [isRegistering, setIsRegistering] = useState(false);

  // Vehicle search and creation
  const [vehiclePlateSearch, setVehiclePlateSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);
  const [hasSearchedVehicle, setHasSearchedVehicle] = useState(false);
  const [showVehicleRegisterForm, setShowVehicleRegisterForm] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState<NewVehicleFormData>({
    plateNo: "",
    vehicleType: "PRIVATE",
    classification: "",
    make: "",
    vehicleModel: "",
    year: undefined,
    color: "",
    bodyMark: "",
    ownerFirstName: "",
    ownerMiddleName: "",
    ownerLastName: "",
  });
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);

  // Violations
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [violationsLoading, setViolationsLoading] = useState(false);

  // Citation form
  const [citationData, setCitationData] = useState<CitationFormData>({
    driverId: "",
    vehicleId: "",
    violationIds: [],
    location: {
      street: "",
      barangay: "",
      city: "",
      province: "",
    },
    violationDateTime: new Date(),
    dueDate: undefined,
    images: [],
    notes: "",
  });

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enforcerId, setEnforcerId] = useState(MOCK_ENFORCER_ID);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: null,
    message: "",
  });

  // Fetch violations on mount
  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    setViolationsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/violations`);
      const data = await response.json();

      if (data.success) {
        setViolations(data.data);
      } else {
        console.error("Failed to fetch violations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching violations:", error);
    } finally {
      setViolationsLoading(false);
    }
  };

  // Search for drivers
  const searchDrivers = async () => {
    if (!driverSearchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/drivers?search=${encodeURIComponent(
          driverSearchQuery
        )}&limit=10`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        console.error("Failed to search drivers:", data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching drivers:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle driver selection
  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setCitationData((prev) => ({ ...prev, driverId: driver._id }));
    setShowRegisterForm(false);
  };

  // Generate password based on pattern: Lastname@YEAR_BORN
  const generatePassword = (lastName: string, birthDate: string) => {
    if (!lastName || !birthDate) return "";
    const year = new Date(birthDate).getFullYear();
    return `${lastName}@${year}`;
  };

  // Register new driver
  const handleRegisterDriver = async () => {
    setIsRegistering(true);

    try {
      // Generate password if not set
      const password =
        newDriverData.password ||
        generatePassword(newDriverData.lastName, newDriverData.birthDate);

      const payload = {
        licenseNo: newDriverData.licenseNo || undefined,
        firstName: newDriverData.firstName,
        lastName: newDriverData.lastName,
        middleName: newDriverData.middleName || undefined,
        email: newDriverData.email || undefined,
        password: password,
        contactNo: newDriverData.contactNo,
        address: newDriverData.address,
        birthDate: newDriverData.birthDate,
        nationality: newDriverData.nationality || "Filipino",
        sex: newDriverData.sex,
        weight: newDriverData.weight || undefined,
        height: newDriverData.height || undefined,
        expirationDate: newDriverData.expirationDate,
        agencyCode: newDriverData.agencyCode || undefined,
        bloodType: newDriverData.bloodType || undefined,
        conditions: newDriverData.conditions || undefined,
        eyesColor: newDriverData.eyesColor || undefined,
        dlCodes: newDriverData.dlCodes || undefined,
      };

      console.log("Sending driver registration payload:", payload);

      const response = await fetch(`${API_BASE_URL}/auth/driver/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Driver registration response:", data);

      if (data.success) {
        const driverData = data.data.driver;
        const newDriver: Driver = {
          _id: driverData.id,
          driverID: driverData.driverID,
          licenseNo: driverData.licenseNo,
          firstName: driverData.firstName,
          middleName: driverData.middleName,
          lastName: driverData.lastName,
          email: driverData.email,
          contactNo: driverData.contactNo,
          address: driverData.address,
          birthDate: driverData.birthDate,
          nationality: driverData.nationality,
          sex: driverData.sex,
          expirationDate: driverData.expirationDate,
          status: driverData.status,
          weight: driverData.weight,
          height: driverData.height,
          bloodType: driverData.bloodType,
          eyesColor: driverData.eyesColor,
          dlCodes: driverData.dlCodes,
        };

        setSelectedDriver(newDriver);
        setCitationData((prev) => ({ ...prev, driverId: newDriver._id }));
        setShowRegisterForm(false);
        setSubmitStatus({
          type: "success",
          message: "Driver registered successfully!",
        });
        setTimeout(() => setSubmitStatus({ type: null, message: "" }), 3000);
      } else {
        console.error("Driver registration error:", data);
        setSubmitStatus({
          type: "error",
          message:
            data.messages?.join(", ") ||
            data.error ||
            "Failed to register driver",
        });
      }
    } catch (error: any) {
      console.error("Driver registration exception:", error);
      setSubmitStatus({
        type: "error",
        message: error.message || "Network error. Please try again.",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Search for vehicle by plate number
  const searchVehicleByPlate = async () => {
    if (!vehiclePlateSearch.trim()) {
      setSelectedVehicle(null);
      setHasSearchedVehicle(false);
      return;
    }

    setIsSearchingVehicle(true);
    setHasSearchedVehicle(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/vehicles/plate/${encodeURIComponent(
          vehiclePlateSearch.toUpperCase()
        )}`
      );
      const data = await response.json();

      if (data.success && data.data) {
        setSelectedVehicle(data.data);
        setCitationData((prev) => ({
          ...prev,
          vehicleId: data.data._id,
        }));
        setShowVehicleRegisterForm(false);
      } else {
        setSelectedVehicle(null);
        setNewVehicleData((prev) => ({
          ...prev,
          plateNo: vehiclePlateSearch.toUpperCase(),
        }));
      }
    } catch (error) {
      console.error("Error searching vehicle:", error);
      setSelectedVehicle(null);
    } finally {
      setIsSearchingVehicle(false);
    }
  };

  // Create new vehicle with owner
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCreatingVehicle(true);

    try {
      const payload = {
        plateNo: newVehicleData.plateNo.toUpperCase(),
        vehicleType: newVehicleData.vehicleType,
        classification: newVehicleData.classification || undefined,
        make: newVehicleData.make || undefined,
        vehicleModel: newVehicleData.vehicleModel || undefined,
        year: newVehicleData.year || undefined,
        color: newVehicleData.color || undefined,
        bodyMark: newVehicleData.bodyMark || undefined,
        ownerFirstName: newVehicleData.ownerFirstName || undefined,
        ownerMiddleName: newVehicleData.ownerMiddleName || undefined,
        ownerLastName: newVehicleData.ownerLastName || undefined,
      };

      const response = await fetch(`${API_BASE_URL}/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        const vehicle = data.data;
        setSelectedVehicle(vehicle);
        setCitationData((prev) => ({
          ...prev,
          vehicleId: vehicle._id,
        }));
        setShowVehicleRegisterForm(false);
        setSubmitStatus({
          type: "success",
          message: "Vehicle registered successfully!",
        });
        setTimeout(() => setSubmitStatus({ type: null, message: "" }), 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to register vehicle",
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Network error. Please try again.",
      });
    } finally {
      setIsCreatingVehicle(false);
    }
  };

  // Handle violation toggle
  const handleViolationToggle = useCallback((violationId: string) => {
    setSelectedViolations((prev) => {
      if (prev.includes(violationId)) {
        return prev.filter((id) => id !== violationId);
      } else {
        return [...prev, violationId];
      }
    });
  }, []);

  // Calculate total fine
  const calculateTotalFine = useCallback(() => {
    if (!selectedVehicle) return 0;

    let total = 0;
    selectedViolations.forEach((violationId) => {
      const violation = violations.find((v) => v._id === violationId);
      if (violation) {
        if (violation.fineStructure === "FIXED" && violation.fixedFine) {
          if (selectedVehicle.vehicleType === "PRIVATE") {
            total += violation.fixedFine.private.driver;
          } else if (selectedVehicle.vehicleType === "FOR_HIRE") {
            total += violation.fixedFine.forHire.driver;
          }
        } else if (
          violation.fineStructure === "PROGRESSIVE" &&
          violation.progressiveFine
        ) {
          if (selectedVehicle.vehicleType === "PRIVATE") {
            total += violation.progressiveFine.private.driver.firstOffense;
          } else if (selectedVehicle.vehicleType === "FOR_HIRE") {
            total += violation.progressiveFine.forHire.driver.firstOffense;
          }
        }
      }
    });
    return total;
  }, [selectedVehicle, selectedViolations, violations]);

  // Submit citation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDriver) {
      setSubmitStatus({
        type: "error",
        message: "Please select or register a driver",
      });
      return;
    }

    if (selectedViolations.length === 0) {
      setSubmitStatus({
        type: "error",
        message: "Please select at least one violation",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const payload = {
        driverId: selectedDriver._id,
        vehicleId: selectedVehicle?._id,
        violationIds: selectedViolations,
        location: citationData.location,
        violationDateTime: citationData.violationDateTime.toISOString(),
        dueDate: citationData.dueDate?.toISOString(),
        images: citationData.images || [],
        notes: citationData.notes || "",
      };

      const response = await fetch(`${API_BASE_URL}/citations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-enforcer-id": enforcerId,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: "success",
          message: "Citation created successfully!",
          citationNo: data.data.citationNo,
        });

        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to create citation",
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDriver(null);
    setShowRegisterForm(false);
    setDriverSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setSelectedViolations([]);
    setSelectedVehicle(null);
    setVehiclePlateSearch("");
    setHasSearchedVehicle(false);
    setShowVehicleRegisterForm(false);
    setCitationData({
      driverId: "",
      vehicleId: "",
      violationIds: [],
      location: {
        street: "",
        barangay: "",
        city: "",
        province: "",
      },
      violationDateTime: new Date(),
      dueDate: undefined,
      images: [],
      notes: "",
    });
    setNewDriverData({
      licenseNo: "",
      firstName: "",
      lastName: "",
      middleName: "",
      email: "",
      password: "",
      contactNo: "",
      address: {
        street: "",
        barangay: "",
        city: "",
        province: "",
        postalCode: "",
      },
      birthDate: "",
      nationality: "Filipino",
      sex: "MALE",
      expirationDate: "",
      dlCodes: [],
    });
    setNewVehicleData({
      plateNo: "",
      vehicleType: "PRIVATE",
      classification: "",
      make: "",
      vehicleModel: "",
      year: undefined,
      color: "",
      bodyMark: "",
      ownerFirstName: "",
      ownerMiddleName: "",
      ownerLastName: "",
    });
    setSubmitStatus({ type: null, message: "" });
    setCurrentStep(1);
  };

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!selectedDriver;
      case 2:
        return !!selectedVehicle;
      case 3:
        return !!(
          citationData.location.barangay &&
          citationData.location.city &&
          citationData.location.province
        );
      case 4:
        return selectedViolations.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length && isStepValid(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / STEPS.length) * 100;
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Traffic Citation</h1>
        <p className="text-muted-foreground">
          Issue a traffic violation ticket - Step by Step
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">
                Step {currentStep} of {STEPS.length}
              </span>
              <span className="text-muted-foreground">
                {STEPS[currentStep - 1].title}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {STEPS.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs text-center font-medium ${
                      isCurrent ? "text-blue-500" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enforcer ID Configuration */}
      <Card className="mb-6 border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg">Test Configuration</CardTitle>
          <CardDescription>
            This is for testing purposes only. In production, the enforcer ID
            will come from authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="enforcerId">Enforcer ID (for testing)</Label>
            <Input
              id="enforcerId"
              value={enforcerId}
              onChange={(e) => setEnforcerId(e.target.value)}
              placeholder="Enter enforcer MongoDB ObjectId"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Alert */}
      {submitStatus.type && (
        <Alert
          className={`mb-6 ${
            submitStatus.type === "success"
              ? "border-green-500"
              : "border-red-500"
          }`}
        >
          {submitStatus.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>
            {submitStatus.type === "success" ? "Success" : "Error"}
          </AlertTitle>
          <AlertDescription>
            {submitStatus.message}
            {submitStatus.citationNo && (
              <div className="mt-2 font-mono font-bold">
                Citation No: {submitStatus.citationNo}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <Step1
            selectedDriver={selectedDriver}
            setSelectedDriver={setSelectedDriver}
            driverSearchQuery={driverSearchQuery}
            setDriverSearchQuery={setDriverSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            hasSearched={hasSearched}
            searchDrivers={searchDrivers}
            showRegisterForm={showRegisterForm}
            setShowRegisterForm={setShowRegisterForm}
            newDriverData={newDriverData}
            setNewDriverData={setNewDriverData}
            isRegistering={isRegistering}
            handleSelectDriver={handleSelectDriver}
            handleRegisterDriver={handleRegisterDriver}
          />
        )}

        {currentStep === 2 && (
          <Step2
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            vehiclePlateSearch={vehiclePlateSearch}
            setVehiclePlateSearch={setVehiclePlateSearch}
            isSearchingVehicle={isSearchingVehicle}
            hasSearchedVehicle={hasSearchedVehicle}
            setHasSearchedVehicle={setHasSearchedVehicle}
            searchVehicleByPlate={searchVehicleByPlate}
            showVehicleRegisterForm={showVehicleRegisterForm}
            setShowVehicleRegisterForm={setShowVehicleRegisterForm}
            newVehicleData={newVehicleData}
            setNewVehicleData={setNewVehicleData}
            isCreatingVehicle={isCreatingVehicle}
            handleCreateVehicle={handleCreateVehicle}
          />
        )}

        {currentStep === 3 && (
          <Step3
            citationData={citationData}
            setCitationData={setCitationData}
          />
        )}

        {currentStep === 4 && (
          <Step4
            violations={violations}
            violationsLoading={violationsLoading}
            selectedViolations={selectedViolations}
            handleViolationToggle={handleViolationToggle}
            selectedVehicle={selectedVehicle}
            calculateTotalFine={calculateTotalFine}
          />
        )}

        {currentStep === 5 && (
          <Step5
            selectedDriver={selectedDriver}
            selectedVehicle={selectedVehicle}
            citationData={citationData}
            selectedViolations={selectedViolations}
            violations={violations}
            calculateTotalFine={calculateTotalFine}
          />
        )}

        {/* Navigation Buttons */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>

                {currentStep < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!isStepValid(currentStep)}
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Submit Citation
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
