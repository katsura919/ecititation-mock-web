'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CalendarIcon, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Search, 
  UserPlus, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Car, 
  MapPin, 
  FileText, 
  ClipboardCheck,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';

// Types
interface Driver {
  _id: string;
  driverID: string;
  licenseNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNo: string;
  address?: string;
  birthDate?: string;
  status: string;
}

interface Violation {
  _id: string;
  code: string;
  title: string;
  description: string;
  fineStructure: 'FIXED' | 'PROGRESSIVE';
  fixedFine?: {
    private: { driver: number; mvOwner: number };
    forHire: { driver: number; operator: number };
  };
  progressiveFine?: {
    private: { driver: { firstOffense: number; secondOffense: number; thirdOffense: number } };
    forHire: { driver: { firstOffense: number; secondOffense: number; thirdOffense: number } };
  };
}

interface NewDriverFormData {
  licenseNo: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  password: string;
  contactNo: string;
  address: {
    street: string;
    barangay: string;
    city: string;
    province: string;
    postalCode: string;
  };
  birthDate: string;
  nationality: string;
  sex: 'MALE' | 'FEMALE';
  weight?: number;
  height?: number;
  expirationDate: string;
  agencyCode?: string;
  bloodType?: string;
  conditions?: string;
  eyesColor?: string;
  diCodes?: string[];
}

interface CitationFormData {
  driverId: string;
  vehicleInfo: {
    plateNo: string;
    vehicleType: 'PRIVATE' | 'FOR_HIRE';
    make?: string;
    model?: string;
    color?: string;
  };
  violationIds: string[];
  location: {
    street?: string;
    barangay: string;
    city: string;
    province: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  violationDateTime: Date;
  dueDate?: Date;
  images?: string[];
  notes?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// HARDCODED ENFORCER ID FOR TESTING
const MOCK_ENFORCER_ID = "69284db9067746a6d0ace561";

// Step definitions
const STEPS = [
  { id: 1, title: 'Select Driver', icon: User, description: 'Search or register driver' },
  { id: 2, title: 'Vehicle Info', icon: Car, description: 'Vehicle details' },
  { id: 3, title: 'Location', icon: MapPin, description: 'Violation location' },
  { id: 4, title: 'Violations', icon: ClipboardCheck, description: 'Select violations' },
  { id: 5, title: 'Review', icon: FileText, description: 'Review & submit' }
];

export default function CitationTestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  // Driver search
  const [driverSearchQuery, setDriverSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Driver[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // New driver registration
  const [newDriverData, setNewDriverData] = useState<NewDriverFormData>({
    licenseNo: '',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: 'Password123!',
    contactNo: '',
    address: {
      street: '',
      barangay: '',
      city: '',
      province: '',
      postalCode: ''
    },
    birthDate: '',
    nationality: 'Filipino',
    sex: 'MALE',
    expirationDate: '',
    diCodes: []
  });
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Violations
  const [violations, setViolations] = useState<Violation[]>([]);
  const [selectedViolations, setSelectedViolations] = useState<string[]>([]);
  const [violationsLoading, setViolationsLoading] = useState(false);
  
  // Citation form
  const [citationData, setCitationData] = useState<CitationFormData>({
    driverId: '',
    vehicleInfo: {
      plateNo: '',
      vehicleType: 'PRIVATE',
      make: '',
      model: '',
      color: ''
    },
    violationIds: [],
    location: {
      street: '',
      barangay: '',
      city: '',
      province: ''
    },
    violationDateTime: new Date(),
    dueDate: undefined,
    images: [],
    notes: ''
  });
  
  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enforcerId, setEnforcerId] = useState(MOCK_ENFORCER_ID);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    citationNo?: string;
  }>({ type: null, message: '' });

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
        console.error('Failed to fetch violations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching violations:', error);
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
        `${API_BASE_URL}/drivers?search=${encodeURIComponent(driverSearchQuery)}&limit=10`
      );
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data);
      } else {
        console.error('Failed to search drivers:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching drivers:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle driver selection
  const handleSelectDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setCitationData(prev => ({ ...prev, driverId: driver._id }));
    setShowRegisterForm(false);
  };

  // Register new driver
  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    
    try {
      // Prepare payload with proper formatting
      const payload = {
        licenseNo: newDriverData.licenseNo,
        firstName: newDriverData.firstName,
        lastName: newDriverData.lastName,
        middleName: newDriverData.middleName || undefined,
        email: newDriverData.email,
        password: newDriverData.password,
        contactNo: newDriverData.contactNo,
        address: newDriverData.address,
        birthDate: newDriverData.birthDate,
        nationality: newDriverData.nationality || 'Filipino',
        sex: newDriverData.sex,
        weight: newDriverData.weight || undefined,
        height: newDriverData.height || undefined,
        expirationDate: newDriverData.expirationDate,
        agencyCode: newDriverData.agencyCode || undefined,
        bloodType: newDriverData.bloodType || undefined,
        eyesColor: newDriverData.eyesColor || undefined,
      };

      console.log('Registering driver with payload:', payload);

      const response = await fetch(`${API_BASE_URL}/auth/driver/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (data.success) {
        // Map the response to our Driver interface
        const driverData = data.data.driver;
        const newDriver: Driver = {
          _id: driverData.id, // Map 'id' to '_id'
          driverID: driverData.driverID,
          licenseNo: driverData.licenseNo,
          firstName: driverData.firstName,
          middleName: driverData.middleName,
          lastName: driverData.lastName,
          email: driverData.email,
          contactNo: driverData.contactNo,
          address: driverData.address,
          birthDate: driverData.birthDate,
          status: driverData.status
        };
        
        console.log('Mapped driver for citation:', newDriver);
        
        setSelectedDriver(newDriver);
        setCitationData(prev => ({ ...prev, driverId: newDriver._id }));
        setShowRegisterForm(false);
        setSubmitStatus({
          type: 'success',
          message: 'Driver registered successfully!'
        });
        setTimeout(() => setSubmitStatus({ type: null, message: '' }), 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to register driver'
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Network error. Please try again.'
      });
    } finally {
      setIsRegistering(false);
    }
  };

  // Handle violation toggle
  const handleViolationToggle = (violationId: string) => {
    setSelectedViolations(prev => {
      if (prev.includes(violationId)) {
        return prev.filter(id => id !== violationId);
      } else {
        return [...prev, violationId];
      }
    });
  };

  // Calculate total fine
  const calculateTotalFine = () => {
    let total = 0;
    selectedViolations.forEach(violationId => {
      const violation = violations.find(v => v._id === violationId);
      if (violation) {
        if (violation.fineStructure === 'FIXED' && violation.fixedFine) {
          if (citationData.vehicleInfo.vehicleType === 'PRIVATE') {
            total += violation.fixedFine.private.driver;
          } else {
            total += violation.fixedFine.forHire.driver;
          }
        } else if (violation.fineStructure === 'PROGRESSIVE' && violation.progressiveFine) {
          if (citationData.vehicleInfo.vehicleType === 'PRIVATE') {
            total += violation.progressiveFine.private.driver.firstOffense;
          } else {
            total += violation.progressiveFine.forHire.driver.firstOffense;
          }
        }
      }
    });
    return total;
  };

  // Submit citation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDriver) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select or register a driver'
      });
      return;
    }

    if (selectedViolations.length === 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please select at least one violation'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const payload = {
        driverId: selectedDriver._id,
        vehicleInfo: citationData.vehicleInfo,
        violationIds: selectedViolations,
        location: citationData.location,
        violationDateTime: citationData.violationDateTime.toISOString(),
        dueDate: citationData.dueDate?.toISOString(),
        images: citationData.images || [],
        notes: citationData.notes || ''
      };

      console.log('Submitting citation payload:', payload);

      const response = await fetch(`${API_BASE_URL}/citations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-enforcer-id': enforcerId,
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Response:', data);

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Citation created successfully!',
          citationNo: data.data.citationNo
        });
        
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to create citation'
        });
      }
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDriver(null);
    setShowRegisterForm(false);
    setDriverSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setSelectedViolations([]);
    setCitationData({
      driverId: '',
      vehicleInfo: {
        plateNo: '',
        vehicleType: 'PRIVATE',
        make: '',
        model: '',
        color: ''
      },
      violationIds: [],
      location: {
        street: '',
        barangay: '',
        city: '',
        province: ''
      },
      violationDateTime: new Date(),
      dueDate: undefined,
      images: [],
      notes: ''
    });
    setNewDriverData({
      licenseNo: '',
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: 'Password123!',
      contactNo: '',
      address: {
        street: '',
        barangay: '',
        city: '',
        province: '',
        postalCode: ''
      },
      birthDate: '',
      nationality: 'Filipino',
      sex: 'MALE',
      expirationDate: '',
      diCodes: []
    });
    setSubmitStatus({ type: null, message: '' });
    setCurrentStep(1);
  };

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Driver Selection
        return !!selectedDriver;
      case 2: // Vehicle Info
        return !!(citationData.vehicleInfo.plateNo && citationData.vehicleInfo.vehicleType);
      case 3: // Location
        return !!(citationData.location.barangay && citationData.location.city && citationData.location.province);
      case 4: // Violations
        return selectedViolations.length > 0;
      case 5: // Review
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
              <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
              <span className="text-muted-foreground">{STEPS[currentStep - 1].title}</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
          
          {/* Step Indicators */}
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-xs text-center font-medium ${isCurrent ? 'text-blue-500' : 'text-gray-500'}`}>
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
            This is for testing purposes only. In production, the enforcer ID will come from authentication.
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
        <Alert className={`mb-6 ${submitStatus.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {submitStatus.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertTitle>{submitStatus.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
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
        {/* Step 1: Select Driver */}
        {currentStep === 1 && (
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
                        {selectedDriver.firstName} {selectedDriver.middleName} {selectedDriver.lastName}
                      </p>
                      <p className="text-sm">License No: {selectedDriver.licenseNo}</p>
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
                        if (e.key === 'Enter') {
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
                                        {driver.firstName} {driver.middleName} {driver.lastName}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        License: {driver.licenseNo}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {driver.email}
                                      </p>
                                    </div>
                                    <Badge variant={driver.status === 'ACTIVE' ? 'default' : 'secondary'}>
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
                            No drivers match your search criteria. You can register a new driver below.
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licenseNo">License Number *</Label>
                      <Input
                        id="licenseNo"
                        value={newDriverData.licenseNo}
                        onChange={(e) => setNewDriverData({ ...newDriverData, licenseNo: e.target.value })}
                        placeholder="N01-12-345678"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={newDriverData.firstName}
                        onChange={(e) => setNewDriverData({ ...newDriverData, firstName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middleName">Middle Name</Label>
                      <Input
                        id="middleName"
                        value={newDriverData.middleName}
                        onChange={(e) => setNewDriverData({ ...newDriverData, middleName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={newDriverData.lastName}
                        onChange={(e) => setNewDriverData({ ...newDriverData, lastName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newDriverData.email}
                        onChange={(e) => setNewDriverData({ ...newDriverData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactNo">Contact Number * (11 digits)</Label>
                      <Input
                        id="contactNo"
                        value={newDriverData.contactNo}
                        onChange={(e) => setNewDriverData({ ...newDriverData, contactNo: e.target.value })}
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
                        onChange={(e) => setNewDriverData({ ...newDriverData, birthDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sex">Sex *</Label>
                      <Select
                        value={newDriverData.sex}
                        onValueChange={(value: 'MALE' | 'FEMALE') => setNewDriverData({ ...newDriverData, sex: value })}
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
                        onChange={(e) => setNewDriverData({ ...newDriverData, nationality: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={newDriverData.weight || ''}
                        onChange={(e) => setNewDriverData({ ...newDriverData, weight: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="70"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newDriverData.height || ''}
                        onChange={(e) => setNewDriverData({ ...newDriverData, height: e.target.value ? Number(e.target.value) : undefined })}
                        placeholder="170"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select
                        value={newDriverData.bloodType || ''}
                        onValueChange={(value) => setNewDriverData({ ...newDriverData, bloodType: value || undefined })}
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
                        value={newDriverData.agencyCode || ''}
                        onChange={(e) => setNewDriverData({ ...newDriverData, agencyCode: e.target.value || undefined })}
                        placeholder="LTO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eyesColor">Eye Color</Label>
                      <Input
                        id="eyesColor"
                        value={newDriverData.eyesColor || ''}
                        onChange={(e) => setNewDriverData({ ...newDriverData, eyesColor: e.target.value || undefined })}
                        placeholder="Brown"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">License Expiration Date *</Label>
                      <Input
                        id="expirationDate"
                        type="date"
                        value={newDriverData.expirationDate}
                        onChange={(e) => setNewDriverData({ ...newDriverData, expirationDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Street *</Label>
                      <Input
                        id="street"
                        value={newDriverData.address.street}
                        onChange={(e) => setNewDriverData({ 
                          ...newDriverData, 
                          address: { ...newDriverData.address, street: e.target.value }
                        })}
                        placeholder="123 Rizal Street"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barangay">Barangay *</Label>
                      <Input
                        id="barangay"
                        value={newDriverData.address.barangay}
                        onChange={(e) => setNewDriverData({ 
                          ...newDriverData, 
                          address: { ...newDriverData.address, barangay: e.target.value }
                        })}
                        placeholder="Barangay San Jose"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressCity">City *</Label>
                      <Input
                        id="addressCity"
                        value={newDriverData.address.city}
                        onChange={(e) => setNewDriverData({ 
                          ...newDriverData, 
                          address: { ...newDriverData.address, city: e.target.value }
                        })}
                        placeholder="Manila"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addressProvince">Province *</Label>
                      <Input
                        id="addressProvince"
                        value={newDriverData.address.province}
                        onChange={(e) => setNewDriverData({ 
                          ...newDriverData, 
                          address: { ...newDriverData.address, province: e.target.value }
                        })}
                        placeholder="Metro Manila"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        value={newDriverData.address.postalCode}
                        onChange={(e) => setNewDriverData({ 
                          ...newDriverData, 
                          address: { ...newDriverData.address, postalCode: e.target.value }
                        })}
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
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Vehicle Information</CardTitle>
              <CardDescription>Enter the details of the vehicle involved</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plateNo">Plate Number *</Label>
                  <Input
                    id="plateNo"
                    value={citationData.vehicleInfo.plateNo}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      vehicleInfo: { ...citationData.vehicleInfo, plateNo: e.target.value }
                    })}
                    placeholder="ABC1234"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type *</Label>
                  <Select
                    value={citationData.vehicleInfo.vehicleType}
                    onValueChange={(value: 'PRIVATE' | 'FOR_HIRE') => 
                      setCitationData({
                        ...citationData,
                        vehicleInfo: { ...citationData.vehicleInfo, vehicleType: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVATE">Private</SelectItem>
                      <SelectItem value="FOR_HIRE">For Hire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    value={citationData.vehicleInfo.make}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      vehicleInfo: { ...citationData.vehicleInfo, make: e.target.value }
                    })}
                    placeholder="Toyota"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={citationData.vehicleInfo.model}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      vehicleInfo: { ...citationData.vehicleInfo, model: e.target.value }
                    })}
                    placeholder="Vios"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={citationData.vehicleInfo.color}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      vehicleInfo: { ...citationData.vehicleInfo, color: e.target.value }
                    })}
                    placeholder="White"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Location Information */}
        {currentStep === 3 && (
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
                    onChange={(e) => setCitationData({
                      ...citationData,
                      location: { ...citationData.location, street: e.target.value }
                    })}
                    placeholder="EDSA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barangay">Barangay *</Label>
                  <Input
                    id="barangay"
                    value={citationData.location.barangay}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      location: { ...citationData.location, barangay: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={citationData.location.city}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      location: { ...citationData.location, city: e.target.value }
                    })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <Input
                    id="province"
                    value={citationData.location.province}
                    onChange={(e) => setCitationData({
                      ...citationData,
                      location: { ...citationData.location, province: e.target.value }
                    })}
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
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {citationData.violationDateTime ? (
                          format(citationData.violationDateTime, 'PPP p')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={citationData.violationDateTime}
                        onSelect={(date) => date && setCitationData({ ...citationData, violationDateTime: date })}
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
                  onChange={(e) => setCitationData({ ...citationData, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional information about the violation..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Violations Selection */}
        {currentStep === 4 && (
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
                    
                    if (violation.fineStructure === 'FIXED' && violation.fixedFine) {
                      fineAmount = citationData.vehicleInfo.vehicleType === 'PRIVATE'
                        ? violation.fixedFine.private.driver
                        : violation.fixedFine.forHire.driver;
                    } else if (violation.fineStructure === 'PROGRESSIVE' && violation.progressiveFine) {
                      fineAmount = citationData.vehicleInfo.vehicleType === 'PRIVATE'
                        ? violation.progressiveFine.private.driver.firstOffense
                        : violation.progressiveFine.forHire.driver.firstOffense;
                    }

                    return (
                      <Card
                        key={violation._id}
                        className={`transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'hover:border-gray-400'
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleViolationToggle(violation._id)}
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
                                  <p className="text-sm mt-1">{violation.description}</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="secondary">{violation.fineStructure}</Badge>
                                  <p className="text-lg font-bold mt-1">₱{fineAmount.toLocaleString()}</p>
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
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Fine:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₱{calculateTotalFine().toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 5: Review & Submit */}
        {currentStep === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 5: Review & Submit</CardTitle>
              <CardDescription>Review all information before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Driver Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Driver Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p><span className="font-medium">Name:</span> {selectedDriver?.firstName} {selectedDriver?.middleName} {selectedDriver?.lastName}</p>
                  <p><span className="font-medium">License No:</span> {selectedDriver?.licenseNo}</p>
                  <p><span className="font-medium">Email:</span> {selectedDriver?.email}</p>
                  <p><span className="font-medium">Contact:</span> {selectedDriver?.contactNo}</p>
                </div>
              </div>

              {/* Vehicle Info */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Vehicle Information
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p><span className="font-medium">Plate No:</span> {citationData.vehicleInfo.plateNo}</p>
                  <p><span className="font-medium">Type:</span> {citationData.vehicleInfo.vehicleType}</p>
                  {citationData.vehicleInfo.make && <p><span className="font-medium">Make:</span> {citationData.vehicleInfo.make}</p>}
                  {citationData.vehicleInfo.model && <p><span className="font-medium">Model:</span> {citationData.vehicleInfo.model}</p>}
                  {citationData.vehicleInfo.color && <p><span className="font-medium">Color:</span> {citationData.vehicleInfo.color}</p>}
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Location
                </h3>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  {citationData.location.street && <p><span className="font-medium">Street:</span> {citationData.location.street}</p>}
                  <p><span className="font-medium">Barangay:</span> {citationData.location.barangay}</p>
                  <p><span className="font-medium">City:</span> {citationData.location.city}</p>
                  <p><span className="font-medium">Province:</span> {citationData.location.province}</p>
                  <p><span className="font-medium">Date & Time:</span> {format(citationData.violationDateTime, 'PPP p')}</p>
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
                    const violation = violations.find(v => v._id === violationId);
                    if (!violation) return null;

                    let fineAmount = 0;
                    if (violation.fineStructure === 'FIXED' && violation.fixedFine) {
                      fineAmount = citationData.vehicleInfo.vehicleType === 'PRIVATE'
                        ? violation.fixedFine.private.driver
                        : violation.fixedFine.forHire.driver;
                    } else if (violation.fineStructure === 'PROGRESSIVE' && violation.progressiveFine) {
                      fineAmount = citationData.vehicleInfo.vehicleType === 'PRIVATE'
                        ? violation.progressiveFine.private.driver.firstOffense
                        : violation.progressiveFine.forHire.driver.firstOffense;
                    }

                    return (
                      <div key={violationId} className="bg-muted p-3 rounded-lg flex justify-between items-start">
                        <div>
                          <p className="font-medium">{violation.title}</p>
                          <p className="text-sm text-muted-foreground">{violation.code}</p>
                        </div>
                        <p className="font-bold">₱{fineAmount.toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Total Fine:</span>
                    <span className="text-2xl font-bold text-blue-600">
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
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
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isStepValid(currentStep)}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Citation...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Create Citation
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
