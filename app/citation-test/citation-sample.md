# Traffic Citation Creation System - Documentation

## Overview

The Traffic Citation Creation System is a comprehensive, multi-step form interface for issuing traffic violations. It provides a streamlined workflow for law enforcement officers to create citations by selecting or registering drivers, vehicles, violations, and location details.

## System Architecture

### Main Page: `page.tsx`

The main page orchestrates the entire citation creation flow with a 5-step wizard interface.

**Location:** `app/citation-test/page.tsx`

**Features:**

- Multi-step form with progress tracking
- Real-time validation for each step
- Integration with backend APIs for driver, vehicle, and citation management
- Status alerts for success/error feedback
- Form state management across all steps

---

## Step-by-Step Workflow

### Step 1: Select or Register Driver

**Component:** `steps/Step1.tsx`

**Purpose:** Search for existing drivers or register new ones in the system.

#### Features:

1. **Driver Search**

   - Search by name or license number
   - Real-time search with debounce
   - Displays search results with driver details
   - Shows driver status badges (ACTIVE, INACTIVE, etc.)

2. **Driver Registration**
   - Complete driver information form
   - Auto-generates password: `Lastname@YEAR_BORN`
   - Validates all required fields
   - Handles both optional and required fields

#### API Integration

**Search Drivers:**

```
GET /api/v1/drivers?search={query}&limit=10
```

**Register New Driver:**

```
POST /api/v1/auth/driver/register
```

**Request Body:**

```json
{
  "licenseNo": "string (optional, 5-20 chars)",
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)",
  "middleName": "string (optional, max 50 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars, auto-generated)",
  "contactNo": "string (required, 11 digits)",
  "address": {
    "street": "string (required)",
    "barangay": "string (required)",
    "city": "string (required)",
    "province": "string (required)",
    "postalCode": "string (required, 4 digits)"
  },
  "birthDate": "string (required, ISO8601 format)",
  "nationality": "string (optional, default: 'Filipino')",
  "sex": "MALE | FEMALE (required)",
  "weight": "number (optional, in kg)",
  "height": "number (optional, in meters)",
  "expirationDate": "string (required, ISO8601 format)",
  "agencyCode": "string (optional, e.g., 'LTO')",
  "bloodType": "string (optional, A+, A-, B+, B-, AB+, AB-, O+, O-)",
  "conditions": "string (optional)",
  "eyesColor": "string (optional)",
  "dlCodes": "array of strings (optional, restriction codes)"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Driver registered successfully",
  "data": {
    "driver": {
      "id": "string (MongoDB ObjectId)",
      "driverID": "string (auto-generated, e.g., DR-20251201-0001)",
      "licenseNo": "string",
      "firstName": "string",
      "lastName": "string",
      "middleName": "string",
      "fullName": "string (computed)",
      "email": "string",
      "contactNo": "string",
      "address": {},
      "birthDate": "string (ISO8601)",
      "age": "number (computed from birthDate)",
      "nationality": "string",
      "sex": "MALE | FEMALE",
      "weight": "number",
      "height": "number",
      "expirationDate": "string (ISO8601)",
      "isLicenseExpired": "boolean (computed)",
      "bloodType": "string",
      "eyesColor": "string",
      "dlCodes": ["string"],
      "status": "ACTIVE | INACTIVE | SUSPENDED | EXPIRED"
    },
    "token": "string (JWT token)"
  }
}
```

---

### Step 2: Vehicle Information

**Component:** `steps/Step2.tsx`

**Purpose:** Search for existing vehicles by plate number or register new ones.

#### Features:

1. **Vehicle Search**

   - Search by plate number (auto-uppercase)
   - Displays complete vehicle details
   - Shows registered owner information

2. **Vehicle Registration**
   - Required: Plate number and vehicle type
   - Optional: Make, model, year, color, classification
   - Owner information (first, middle, last name)
   - Automatic owner creation if needed

#### API Integration

**Search Vehicle by Plate:**

```
GET /api/v1/vehicles/plate/{plateNo}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "string (MongoDB ObjectId)",
    "plateNo": "string (uppercase)",
    "vehicleType": "PRIVATE | FOR_HIRE | GOVERNMENT | DIPLOMATIC",
    "classification": "string",
    "make": "string",
    "vehicleModel": "string",
    "year": "number",
    "color": "string",
    "ownerFirstName": "string",
    "ownerMiddleName": "string",
    "ownerLastName": "string",
    "status": "ACTIVE | INACTIVE | IMPOUNDED | SUSPENDED"
  }
}
```

**Create New Vehicle:**

```
POST /api/v1/vehicles
```

**Request Body:**

```json
{
  "plateNo": "string (required, uppercase)",
  "vehicleType": "PRIVATE | FOR_HIRE | GOVERNMENT | DIPLOMATIC (required)",
  "classification": "string (optional, e.g., Sedan, SUV, Motorcycle)",
  "make": "string (optional)",
  "vehicleModel": "string (optional)",
  "year": "number (optional)",
  "color": "string (optional)",
  "bodyMark": "string (optional, e.g., dent on left door)",
  "ownerFirstName": "string (optional)",
  "ownerMiddleName": "string (optional)",
  "ownerLastName": "string (optional)"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": {
    "_id": "string (MongoDB ObjectId)",
    "vehicleID": "string (auto-generated, e.g., VH-20251201-1234)",
    "plateNo": "string",
    "vehicleType": "string",
    "make": "string",
    "vehicleModel": "string",
    "year": "number",
    "color": "string",
    "ownerFirstName": "string",
    "ownerMiddleName": "string",
    "ownerLastName": "string",
    "status": "ACTIVE",
    "createdAt": "string (ISO8601)",
    "updatedAt": "string (ISO8601)"
  }
}
```

---

### Step 3: Violation Location

**Component:** `steps/Step3.tsx`

**Purpose:** Capture the location where the traffic violation occurred.

#### Features:

1. **GPS Coordinates Capture**

   - Uses browser's Geolocation API
   - High accuracy location tracking
   - Displays captured coordinates (latitude/longitude)
   - Error handling for denied permissions

2. **Manual Location Entry**

   - Street/Road (optional)
   - Barangay (required)
   - City (required)
   - Province (required)

3. **Date & Time Selection**

   - Violation date and time picker
   - Calendar interface with time selection
   - Defaults to current date/time

4. **Additional Notes**
   - Free-text area for additional information
   - Optional field for extra details

#### Location Data Structure:

```json
{
  "location": {
    "street": "string (optional)",
    "barangay": "string (required)",
    "city": "string (required)",
    "province": "string (required)",
    "coordinates": {
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    }
  },
  "violationDateTime": "Date (required)",
  "notes": "string (optional)"
}
```

---

### Step 4: Select Violations

**Component:** `steps/Step4.tsx`

**Purpose:** Select one or more traffic violations committed by the driver.

#### Features:

1. **Violation List**

   - Displays all available violations from database
   - Shows violation code, title, and description
   - Displays legal reference for each violation
   - Multi-select functionality (click to toggle)

2. **Fine Calculation**

   - **Fixed Fine Structure:**

     - Different rates for PRIVATE vs FOR_HIRE vehicles
     - Separate fines for driver and vehicle owner/operator

   - **Progressive Fine Structure:**
     - 1st, 2nd, 3rd, and subsequent offenses
     - Escalating penalties for repeat violations
     - Different rates based on vehicle type

3. **Real-time Total Calculation**
   - Automatically calculates total fine amount
   - Shows selected violation count
   - Displays fine per violation and total

#### API Integration

**Get All Violations:**

```
GET /api/v1/violations
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "string (MongoDB ObjectId)",
      "code": "string (e.g., '1i')",
      "title": "string (e.g., 'Reckless Driving')",
      "description": "string",
      "fineStructure": "FIXED | PROGRESSIVE",
      "legalReference": "string (optional)",
      "fixedFine": {
        "private": {
          "driver": "number",
          "mvOwner": "number"
        },
        "forHire": {
          "driver": "number",
          "operator": "number"
        }
      },
      "progressiveFine": {
        "private": {
          "driver": {
            "firstOffense": "number",
            "secondOffense": "number",
            "thirdOffense": "number",
            "subsequentOffense": "number"
          },
          "mvOwner": {}
        },
        "forHire": {
          "driver": {},
          "operator": {}
        }
      },
      "accessoryPenalty": "string (optional)",
      "isActive": "boolean"
    }
  ]
}
```

#### Fine Calculation Logic:

```typescript
// For FIXED fines
const fineAmount =
  selectedVehicle.vehicleType === "PRIVATE"
    ? violation.fixedFine.private.driver
    : violation.fixedFine.forHire.driver;

// For PROGRESSIVE fines (first offense)
const fineAmount =
  selectedVehicle.vehicleType === "PRIVATE"
    ? violation.progressiveFine.private.driver.firstOffense
    : violation.progressiveFine.forHire.driver.firstOffense;
```

---

### Step 5: Review & Submit

**Component:** `steps/Step5.tsx`

**Purpose:** Review all entered information before final submission.

#### Features:

1. **Comprehensive Review**

   - Driver information summary
   - Vehicle details with owner info
   - Location and violation date/time
   - List of all selected violations with individual fines
   - Total fine amount calculation
   - Due date display

2. **Organized Display**

   - Color-coded sections for easy scanning
   - Driver info (blue theme)
   - Vehicle info (green theme)
   - Location (purple theme)
   - Violations (red theme)

3. **Information Verification**
   - All required fields validated
   - Clear display of all entered data
   - Final confirmation before submission

---

## Citation Submission

### API Endpoint

```
POST /api/v1/citations
```

### Request Headers

```
Content-Type: application/json
x-enforcer-id: string (MongoDB ObjectId of enforcer)
```

### Request Body

```json
{
  "driverId": "string (required, MongoDB ObjectId)",
  "vehicleId": "string (required, MongoDB ObjectId)",
  "violationIds": ["string (required, array of MongoDB ObjectIds, min 1)"],
  "location": {
    "street": "string (optional)",
    "barangay": "string (required)",
    "city": "string (required)",
    "province": "string (required)",
    "coordinates": {
      "latitude": "number (optional)",
      "longitude": "number (optional)"
    }
  },
  "violationDateTime": "string (required, ISO8601 format)",
  "dueDate": "string (optional, ISO8601 format, defaults to +15 days)",
  "images": ["string (optional, array of image URLs)"],
  "notes": "string (optional)"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Citation created successfully",
  "data": {
    "_id": "string (MongoDB ObjectId)",
    "citationNo": "string (e.g., TCT-2025-000001)",
    "driverId": {
      "firstName": "string",
      "lastName": "string",
      "licenseNo": "string",
      "contactNo": "string"
    },
    "issuedBy": {
      "badgeNo": "string",
      "name": "string",
      "email": "string",
      "contactNo": "string"
    },
    "violations": [
      {
        "violationId": "string",
        "code": "string",
        "title": "string",
        "description": "string",
        "fineAmount": "number",
        "offenseCount": "number"
      }
    ],
    "vehicleInfo": {
      "plateNo": "string",
      "vehicleType": "string",
      "make": "string",
      "model": "string",
      "color": "string"
    },
    "location": {
      "street": "string",
      "barangay": "string",
      "city": "string",
      "province": "string",
      "coordinates": {
        "latitude": "number",
        "longitude": "number"
      }
    },
    "totalAmount": "number",
    "amountPaid": "number",
    "amountDue": "number",
    "status": "PENDING",
    "violationDateTime": "string (ISO8601)",
    "issuedAt": "string (ISO8601)",
    "dueDate": "string (ISO8601)",
    "images": ["string"],
    "notes": "string",
    "isVoid": "boolean"
  }
}
```

### Error Response (400/500)

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

---

## State Management

### Main State Variables

```typescript
// Step navigation
const [currentStep, setCurrentStep] = useState(1); // 1-5

// Driver state
const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
const [driverSearchQuery, setDriverSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<Driver[]>([]);
const [newDriverData, setNewDriverData] = useState<NewDriverFormData>({...});

// Vehicle state
const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
const [vehiclePlateSearch, setVehiclePlateSearch] = useState("");
const [newVehicleData, setNewVehicleData] = useState<NewVehicleFormData>({...});

// Violations state
const [violations, setViolations] = useState<Violation[]>([]);
const [selectedViolations, setSelectedViolations] = useState<string[]>([]);

// Citation data
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

// UI state
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
  type: null,
  message: "",
});
```

---

## Step Validation

Each step has validation rules that must be satisfied before proceeding to the next step:

```typescript
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
      return true; // Review step, always valid
    default:
      return false;
  }
};
```

---

## Form Reset Functionality

After successful submission, the form resets to initial state:

```typescript
const resetForm = () => {
  setSelectedDriver(null);
  setSelectedVehicle(null);
  setSelectedViolations([]);
  setCitationData({
    /* reset to defaults */
  });
  setNewDriverData({
    /* reset to defaults */
  });
  setNewVehicleData({
    /* reset to defaults */
  });
  setCurrentStep(1);
  // ... reset all other state variables
};
```

---

## Key Features

### 1. Progressive Disclosure

- Only shows relevant information at each step
- Reduces cognitive load for the user
- Clear progress indication

### 2. Real-time Validation

- Validates input as user types
- Provides immediate feedback
- Prevents submission of invalid data

### 3. Error Handling

- Comprehensive error messages
- Network error handling
- Validation error display
- Success/failure status alerts

### 4. Responsive Design

- Mobile-friendly interface
- Adapts to different screen sizes
- Touch-optimized controls

### 5. Accessibility

- Proper form labels
- Keyboard navigation support
- Screen reader friendly
- Clear focus indicators

---

## Environment Configuration

```typescript
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const MOCK_ENFORCER_ID = "69284db9067746a6d0ace561"; // For testing
```

---

## Citation Status Values

| Status         | Description                       |
| -------------- | --------------------------------- |
| PENDING        | Citation issued, awaiting payment |
| PAID           | Fine paid in full                 |
| PARTIALLY_PAID | Partial payment made              |
| OVERDUE        | Past due date                     |
| CONTESTED      | Driver is contesting the citation |
| DISMISSED      | Citation dismissed/cancelled      |
| VOID           | Citation voided by admin          |

---

## Vehicle Types

| Type       | Description                 |
| ---------- | --------------------------- |
| PRIVATE    | Private vehicle             |
| FOR_HIRE   | Commercial/for-hire vehicle |
| GOVERNMENT | Government vehicle          |
| DIPLOMATIC | Diplomatic vehicle          |

---

## Usage Flow

1. **Start**: Officer initiates citation creation
2. **Step 1**: Search for driver or register new driver
3. **Step 2**: Search for vehicle or register new vehicle
4. **Step 3**: Enter violation location and capture GPS coordinates
5. **Step 4**: Select traffic violations committed
6. **Step 5**: Review all information
7. **Submit**: Create citation and generate citation number
8. **Success**: Display citation number and reset form

---

## Error Scenarios

### Common Validation Errors

- Missing required fields
- Invalid email format
- Invalid contact number format (must be 11 digits)
- Invalid postal code (must be 4 digits)
- License number too short/long (5-20 characters)
- Password too short (minimum 6 characters)

### API Errors

- Duplicate email or license number
- Driver not found
- Vehicle not found
- Violation not found
- Invalid enforcer ID
- Network connection issues

---

## Testing Endpoints

### Using cURL

**Create Citation:**

```bash
curl -X POST http://localhost:5000/api/v1/citations \
  -H "Content-Type: application/json" \
  -H "x-enforcer-id: 69284db9067746a6d0ace561" \
  -d '{
    "driverId": "67123abc456def789",
    "vehicleId": "67123abc456def790",
    "violationIds": ["67123abc456def791"],
    "location": {
      "barangay": "Guadalupe",
      "city": "Makati City",
      "province": "Metro Manila"
    },
    "violationDateTime": "2025-12-15T10:30:00Z",
    "notes": "Caught speeding on EDSA"
  }'
```

**Register Driver:**

```bash
curl -X POST http://localhost:5000/api/v1/auth/driver/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Cruz",
    "email": "juan.cruz@email.com",
    "password": "Cruz@1990",
    "contactNo": "09171234567",
    "birthDate": "1990-01-15",
    "sex": "MALE",
    "address": {
      "street": "123 Rizal St",
      "barangay": "San Jose",
      "city": "Manila",
      "province": "Metro Manila",
      "postalCode": "1000"
    },
    "expirationDate": "2027-12-31"
  }'
```

---

## Dependencies

### UI Components (shadcn/ui)

- Button
- Input
- Label
- Card
- Select
- Alert
- Badge
- Calendar
- Popover
- Separator
- Textarea

### Icons (lucide-react)

- User, Car, MapPin, ClipboardCheck, FileText
- Search, Plus, X, CheckCircle2, AlertCircle
- Loader2, CalendarIcon

### Utilities

- date-fns (for date formatting)
- React hooks (useState, useEffect, useCallback)

---

## Future Enhancements

1. **Image Upload**: Add photo evidence capture functionality
2. **Offline Mode**: Cache citations when offline
3. **Signature Capture**: Digital signature for driver acknowledgment
4. **Print Citation**: Generate printable citation receipt
5. **QR Code**: Generate QR code for quick citation lookup
6. **History**: View recently created citations
7. **Drafts**: Save incomplete citations as drafts

---

## Support & Troubleshooting

### Common Issues

**Issue**: Driver registration fails with validation error

- **Solution**: Check that all required fields are filled and match validation rules (email format, phone length, etc.)

**Issue**: Vehicle not found by plate number

- **Solution**: Ensure plate number is entered in uppercase; create new vehicle if not in system

**Issue**: Citation submission fails

- **Solution**: Verify that driver, vehicle, and at least one violation are selected; check network connection

**Issue**: GPS location not captured

- **Solution**: Ensure browser location permissions are granted; use manual location entry if GPS unavailable

---

## API Documentation References

- **Citation API**: `/backend/docs/citation-api.md`
- **Vehicle API**: `/backend/docs/vehicle-api.md`
- **Driver Routes**: `/backend/src/modules/v1/authentication/driver/`

---

## Progressive Fine Implementation - Current Status

### ⚠️ IMPORTANT: Progressive Fines Currently Default to First Offense

Based on the backend code analysis, the progressive fine system is **partially implemented**. Here's what you need to know:

### Current Implementation

**Location**: `backend/src/modules/v1/citations/citations.controller.ts` (Lines 104-127)

```typescript
// Build violation items with calculated fines
const violationItems = violations.map((violation) => {
  let fineAmount = 0;

  if (violation.fineStructure === "FIXED" && violation.fixedFine) {
    // Fixed fines work as expected
    if (vehicle.vehicleType === "PRIVATE") {
      fineAmount = violation.fixedFine.private.driver;
    } else if (vehicle.vehicleType === "FOR_HIRE") {
      fineAmount = violation.fixedFine.forHire.driver;
    }
  } else if (
    violation.fineStructure === "PROGRESSIVE" &&
    violation.progressiveFine
  ) {
    // ⚠️ ALWAYS DEFAULTS TO FIRST OFFENSE
    // Comment in code: "For now, default to first offense"
    // Comment in code: "In a real system, you'd check driver's violation history"
    if (vehicle.vehicleType === "PRIVATE") {
      fineAmount = violation.progressiveFine.private.driver.firstOffense;
    } else if (vehicle.vehicleType === "FOR_HIRE") {
      fineAmount = violation.progressiveFine.forHire.driver.firstOffense;
    }
  }

  return {
    violationId: violation._id,
    code: violation.code,
    title: violation.title,
    description: violation.description,
    fineAmount,
    offenseCount: 1, // ⚠️ HARDCODED TO 1 (first offense)
  };
});
```

### What's Missing

The system **does NOT currently**:

- Check the driver's violation history
- Count previous violations of the same type
- Automatically escalate fines for repeat offenders
- Distinguish between 1st, 2nd, 3rd, or subsequent offenses

### How to Implement Automatic Offense Counting

To fully implement progressive fines, you need to add the following logic:

#### 1. **Query Previous Citations**

Before calculating the fine, query the database for previous citations:

```typescript
// Get driver's previous violations of the same type
const previousCitations = await Citation.find({
  driverId: driverId,
  "violations.violationId": violation._id,
  status: {
    $in: [CitationStatus.PAID, CitationStatus.PENDING, CitationStatus.OVERDUE],
  },
  isVoid: false,
  _id: { $ne: citation._id }, // Exclude current citation if updating
});

// Count how many times this violation was committed
const offenseCount =
  previousCitations.reduce((count, citation) => {
    const violationCount = citation.violations.filter(
      (v) => v.violationId.toString() === violation._id.toString()
    ).length;
    return count + violationCount;
  }, 0) + 1; // +1 for current offense
```

#### 2. **Calculate Progressive Fine Based on Offense Count**

```typescript
let fineAmount = 0;

if (violation.fineStructure === "PROGRESSIVE" && violation.progressiveFine) {
  const fineSchedule =
    vehicle.vehicleType === "PRIVATE"
      ? violation.progressiveFine.private.driver
      : violation.progressiveFine.forHire.driver;

  // Determine fine based on offense count
  if (offenseCount === 1) {
    fineAmount = fineSchedule.firstOffense;
  } else if (offenseCount === 2 && fineSchedule.secondOffense) {
    fineAmount = fineSchedule.secondOffense;
  } else if (offenseCount === 3 && fineSchedule.thirdOffense) {
    fineAmount = fineSchedule.thirdOffense;
  } else if (fineSchedule.subsequentOffense) {
    fineAmount = fineSchedule.subsequentOffense;
  } else {
    // If no subsequent offense defined, use the highest available
    fineAmount =
      fineSchedule.thirdOffense ||
      fineSchedule.secondOffense ||
      fineSchedule.firstOffense;
  }
}
```

#### 3. **Updated Implementation Example**

Here's the complete updated code for `citations.controller.ts`:

```typescript
// Build violation items with calculated fines
const violationItems = await Promise.all(
  violations.map(async (violation) => {
    let fineAmount = 0;
    let offenseCount = 1;

    if (violation.fineStructure === "FIXED" && violation.fixedFine) {
      // Fixed fines remain the same
      if (vehicle.vehicleType === "PRIVATE") {
        fineAmount = violation.fixedFine.private.driver;
      } else if (vehicle.vehicleType === "FOR_HIRE") {
        fineAmount = violation.fixedFine.forHire.driver;
      }
    } else if (
      violation.fineStructure === "PROGRESSIVE" &&
      violation.progressiveFine
    ) {
      // Check driver's violation history
      const previousCitations = await Citation.find({
        driverId: driverId,
        "violations.violationId": violation._id,
        status: {
          $in: [
            CitationStatus.PAID,
            CitationStatus.PENDING,
            CitationStatus.OVERDUE,
            CitationStatus.PARTIALLY_PAID,
          ],
        },
        isVoid: false,
      });

      // Count total occurrences of this specific violation
      offenseCount =
        previousCitations.reduce((count, citation) => {
          const violationCount = citation.violations.filter(
            (v: any) => v.violationId.toString() === violation._id.toString()
          ).length;
          return count + violationCount;
        }, 0) + 1; // +1 for current offense

      // Get appropriate fine schedule
      const fineSchedule =
        vehicle.vehicleType === "PRIVATE"
          ? violation.progressiveFine.private.driver
          : violation.progressiveFine.forHire.driver;

      // Determine fine based on offense count
      if (offenseCount === 1) {
        fineAmount = fineSchedule.firstOffense;
      } else if (offenseCount === 2 && fineSchedule.secondOffense) {
        fineAmount = fineSchedule.secondOffense;
      } else if (offenseCount === 3 && fineSchedule.thirdOffense) {
        fineAmount = fineSchedule.thirdOffense;
      } else if (fineSchedule.subsequentOffense) {
        fineAmount = fineSchedule.subsequentOffense;
      } else {
        // Fallback to highest available fine
        fineAmount =
          fineSchedule.thirdOffense ||
          fineSchedule.secondOffense ||
          fineSchedule.firstOffense;
      }
    }

    return {
      violationId: violation._id,
      code: violation.code,
      title: violation.title,
      description: violation.description,
      fineAmount,
      offenseCount, // Now dynamic instead of hardcoded to 1
    };
  })
);
```

### Important Considerations

1. **Performance**: Querying previous citations for each violation adds database overhead. Consider:

   - Caching driver violation history
   - Indexing the `violations.violationId` field
   - Batch querying if creating citations with multiple violations

2. **Date Range**: You may want to only count violations within a specific time period (e.g., last 12 months):

   ```typescript
   const twelveMonthsAgo = new Date();
   twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

   const previousCitations = await Citation.find({
     driverId: driverId,
     "violations.violationId": violation._id,
     violationDateTime: { $gte: twelveMonthsAgo },
     // ... rest of query
   });
   ```

3. **Paid vs Unpaid**: Current implementation counts PENDING and OVERDUE violations. You might want to only count PAID violations to prevent gaming the system.

4. **Void Citations**: The code correctly excludes voided citations (`isVoid: false`).

### Database Indexes Needed

Add these indexes for better performance:

```typescript
// In citation.model.ts
CitationSchema.index({ driverId: 1, "violations.violationId": 1 });
CitationSchema.index({ driverId: 1, violationDateTime: -1 });
CitationSchema.index({ status: 1, isVoid: 1 });
```

### Testing the Implementation

1. **Create first offense** for a driver with violation "1i" (Reckless Driving)

   - Verify `offenseCount: 1` and fine = `firstOffense` amount

2. **Create second offense** for same driver, same violation

   - Verify `offenseCount: 2` and fine = `secondOffense` amount

3. **Create multiple violations** in one citation

   - Each violation should have independent offense counting

4. **Test with voided citations**
   - Voided citations should not count toward offense history

---

## Version Information

- **Created**: December 2025
- **Framework**: Next.js 14+ with TypeScript
- **UI Library**: shadcn/ui
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Progressive Fine Status**: ⚠️ Partially Implemented (defaults to first offense)
