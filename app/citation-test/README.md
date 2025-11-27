# Traffic Citation Test Page

## Overview

This is a comprehensive multi-step form interface for creating traffic citations in the eCitation system. The page provides a user-friendly, wizard-style workflow that guides enforcers through the entire citation creation process, from driver selection to violation documentation.

**Page Location:** `/citation-test`

**User Role:** Traffic Enforcer (ETCMF)

---

## Features

### 🎯 Multi-Step Workflow

The citation creation process is divided into **5 logical steps**:

1. **Select Driver** - Search existing drivers or register new ones
2. **Vehicle Information** - Capture vehicle details
3. **Location** - Record where the violation occurred
4. **Violations** - Select applicable traffic violations
5. **Review & Submit** - Final review before citation creation

### ✨ Key Capabilities

- **Driver Search** - Real-time search by name or license number
- **Driver Registration** - On-the-fly driver registration with full LTO-compliant fields
- **Violation Selection** - Multiple violations per citation with automatic fine calculation
- **Progressive & Fixed Fines** - Smart calculation based on vehicle type and offense history
- **Location Tracking** - Structured address capture with optional GPS coordinates
- **Visual Progress Tracking** - Clear progress indicators and step validation
- **Form Validation** - Step-by-step validation ensuring data completeness
- **Responsive Design** - Works on desktop and mobile devices

---

## Implementation Details

### State Management

The component uses React hooks (`useState`, `useEffect`) to manage:

- **Multi-step navigation** - Current step tracking with validation
- **Driver data** - Selected or newly registered driver information
- **Citation form data** - Vehicle info, location, violations, notes
- **Violations catalog** - Fetched from backend API
- **UI states** - Loading, submitting, searching, registering

### API Integration

**Base URL:** `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000/api`)

#### Endpoints Used:

1. **GET** `/violations` - Fetch all available violations
2. **GET** `/drivers?search={query}&limit=10` - Search for drivers
3. **POST** `/auth/driver/register` - Register new driver
4. **POST** `/citations` - Create new citation (with `x-enforcer-id` header)

---

## Step-by-Step Breakdown

### Step 1: Select Driver

**Purpose:** Identify the driver who committed the violation

**Options:**

- **Search Existing Driver** - By name or license number
- **Register New Driver** - Full driver registration form

#### Search Functionality

- Real-time search with debounced API calls
- Displays matching results with driver details
- Shows driver status (ACTIVE, SUSPENDED, etc.)
- Click to select driver

#### Driver Registration Form

**Required Fields (matches backend Driver model):**

| Field              | Type   | Validation                   | Backend Field    |
| ------------------ | ------ | ---------------------------- | ---------------- |
| License Number     | String | Required, unique             | `licenseNo`      |
| First Name         | String | Required, 2-50 chars         | `firstName`      |
| Last Name          | String | Required, 2-50 chars         | `lastName`       |
| Middle Name        | String | Optional                     | `middleName`     |
| Email              | Email  | Required, valid email        | `email`          |
| Password           | String | Auto-filled with default     | `password`       |
| Contact Number     | String | Required, 11 digits          | `contactNo`      |
| Birth Date         | Date   | Required, 18+ years old      | `birthDate`      |
| Sex                | Enum   | Required (MALE/FEMALE)       | `sex`            |
| Nationality        | String | Required, default "Filipino" | `nationality`    |
| License Expiration | Date   | Required                     | `expirationDate` |

**Address Fields (nested object):**

| Field       | Type   | Required      | Backend Field        |
| ----------- | ------ | ------------- | -------------------- |
| Street      | String | Yes           | `address.street`     |
| Barangay    | String | Yes           | `address.barangay`   |
| City        | String | Yes           | `address.city`       |
| Province    | String | Yes           | `address.province`   |
| Postal Code | String | Yes, 4 digits | `address.postalCode` |

**Optional Fields:**

| Field       | Type   | Backend Field |
| ----------- | ------ | ------------- |
| Weight (kg) | Number | `weight`      |
| Height (cm) | Number | `height`      |
| Blood Type  | Enum   | `bloodType`   |
| Agency Code | String | `agencyCode`  |
| Eye Color   | String | `eyesColor`   |

**Backend Response Mapping:**

```typescript
// Backend returns 'id', frontend expects '_id'
const newDriver: Driver = {
  _id: driverData.id, // Mapped from 'id' to '_id'
  driverID: driverData.driverID,
  licenseNo: driverData.licenseNo,
  // ... other fields
};
```

---

### Step 2: Vehicle Information

**Purpose:** Record details of the vehicle involved in the violation

**Fields (matches backend Citation vehicleInfo):**

| Field        | Type   | Required               | Backend Field             |
| ------------ | ------ | ---------------------- | ------------------------- |
| Plate Number | String | Yes, uppercase         | `vehicleInfo.plateNo`     |
| Vehicle Type | Enum   | Yes (PRIVATE/FOR_HIRE) | `vehicleInfo.vehicleType` |
| Make         | String | Optional               | `vehicleInfo.make`        |
| Model        | String | Optional               | `vehicleInfo.model`       |
| Color        | String | Optional               | `vehicleInfo.color`       |

**Note:** Vehicle type affects fine calculation (PRIVATE vs FOR_HIRE have different fine structures)

---

### Step 3: Location Information

**Purpose:** Document where the violation occurred

**Fields (matches backend Citation location):**

| Field                 | Type     | Required               | Backend Field          |
| --------------------- | -------- | ---------------------- | ---------------------- |
| Street/Road           | String   | No                     | `location.street`      |
| Barangay              | String   | Yes                    | `location.barangay`    |
| City                  | String   | Yes                    | `location.city`        |
| Province              | String   | Yes                    | `location.province`    |
| Violation Date & Time | DateTime | Yes, auto-fills to now | `violationDateTime`    |
| GPS Coordinates       | Object   | Optional               | `location.coordinates` |

**Additional Fields:**

| Field            | Type     | Required | Backend Field |
| ---------------- | -------- | -------- | ------------- |
| Additional Notes | Textarea | No       | `notes`       |

---

### Step 4: Violations Selection

**Purpose:** Select applicable traffic violations with automatic fine calculation

**Features:**

- Checkbox selection for multiple violations
- Real-time display of violation details
- Automatic fine calculation based on:
  - Vehicle type (PRIVATE/FOR_HIRE)
  - Fine structure (FIXED/PROGRESSIVE)
  - Offense count (1st offense for new citations)
- Running total of all selected fines

**Violation Display:**

Each violation shows:

- **Title** - Violation name
- **Code** - Violation code
- **Description** - Full violation description
- **Fine Structure** - Badge showing FIXED or PROGRESSIVE
- **Amount** - Calculated fine for the driver

**Fine Calculation Logic:**

```typescript
// FIXED fine structure
if (violation.fineStructure === "FIXED") {
  fine =
    vehicleType === "PRIVATE"
      ? violation.fixedFine.private.driver
      : violation.fixedFine.forHire.driver;
}

// PROGRESSIVE fine structure
if (violation.fineStructure === "PROGRESSIVE") {
  fine =
    vehicleType === "PRIVATE"
      ? violation.progressiveFine.private.driver.firstOffense
      : violation.progressiveFine.forHire.driver.firstOffense;
}
```

**Backend Field:** `violationIds` (array of ObjectIds)

---

### Step 5: Review & Submit

**Purpose:** Final review before citation creation

**Displays:**

- ✅ Driver Information summary
- ✅ Vehicle Information summary
- ✅ Location details
- ✅ Selected violations with individual fines
- ✅ **Total Fine Amount** (prominently displayed)
- ✅ Additional notes (if provided)

**Actions:**

- **Previous** - Go back to edit information
- **Reset** - Clear entire form
- **Create Citation** - Submit to backend

---

## Backend API Payload

### Citation Creation Request

**Method:** `POST /api/citations`

**Headers:**

```json
{
  "Content-Type": "application/json",
  "x-enforcer-id": "68f3135067ba4a165e53ca85" // MongoDB ObjectId
}
```

**Request Body Structure:**

```typescript
{
  "driverId": "string",              // MongoDB ObjectId (required)
  "vehicleInfo": {
    "plateNo": "string",             // Required, uppercase
    "vehicleType": "PRIVATE" | "FOR_HIRE",  // Required
    "make": "string",                // Optional
    "model": "string",               // Optional
    "color": "string"                // Optional
  },
  "violationIds": ["string"],        // Array of ObjectIds (min 1)
  "location": {
    "street": "string",              // Optional
    "barangay": "string",            // Required
    "city": "string",                // Required
    "province": "string",            // Required
    "coordinates": {                 // Optional
      "latitude": number,
      "longitude": number
    }
  },
  "violationDateTime": "ISO8601",    // Date string
  "dueDate": "ISO8601",              // Optional, defaults to +15 days
  "images": ["string"],              // Array of image URLs (optional)
  "notes": "string"                  // Optional
}
```

**Success Response:**

```typescript
{
  "success": true,
  "message": "Citation created successfully!",
  "data": {
    "citationNo": "TCT-2025-000001",   // Auto-generated
    "driverId": { /* populated driver */ },
    "vehicleInfo": { /* vehicle details */ },
    "violations": [ /* populated violations */ ],
    "totalAmount": 1500,
    "amountPaid": 0,
    "amountDue": 1500,
    "status": "PENDING",
    "issuedAt": "2025-11-27T10:30:00Z",
    "dueDate": "2025-12-12T23:59:59Z",
    // ... other fields
  }
}
```

---

## Field Validation

### Step Validation Logic

Each step must be valid before proceeding:

```typescript
const isStepValid = (step: number): boolean => {
  switch (step) {
    case 1:
      return !!selectedDriver;
    case 2:
      return !!(plateNo && vehicleType);
    case 3:
      return !!(barangay && city && province);
    case 4:
      return selectedViolations.length > 0;
    case 5:
      return true;
  }
};
```

### Driver Registration Validation

- **License Number** - Must be unique (checked by backend)
- **Contact Number** - Exactly 11 digits
- **Email** - Valid email format
- **Birth Date** - Driver must be 18+ years old
- **Postal Code** - Exactly 4 digits
- **Required Fields** - All marked fields must be filled

### Citation Validation

- **Driver Selected** - Cannot proceed without driver
- **At least 1 Violation** - Must select minimum one violation
- **Location Required** - Barangay, city, province mandatory
- **Plate Number** - Cannot be empty

---

## UI Components Used

### Shadcn/UI Components

- `Button` - Primary actions and navigation
- `Input` - Text input fields
- `Textarea` - Notes and descriptions
- `Select` - Dropdown selections
- `Checkbox` - Violation selection
- `Card` - Content containers
- `Alert` - Success/error messages
- `Badge` - Status indicators
- `Progress` - Step progress bar
- `Calendar` - Date/time picker
- `Popover` - Calendar popup
- `Separator` - Visual dividers

### Lucide Icons

- `User`, `Car`, `MapPin`, `FileText`, `ClipboardCheck` - Step icons
- `Search`, `UserPlus` - Action icons
- `CheckCircle2`, `AlertCircle` - Status icons
- `Loader2` - Loading spinner
- `ArrowRight`, `ArrowLeft` - Navigation
- `X` - Close/cancel actions
- `CalendarIcon` - Date picker

---

## State Flow

```
1. Page Load
   ↓
2. Fetch Violations from API
   ↓
3. User Searches/Registers Driver
   ↓
4. Select Driver → Set driverId
   ↓
5. Fill Vehicle Info
   ↓
6. Fill Location
   ↓
7. Select Violations → Calculate Total
   ↓
8. Review All Data
   ↓
9. Submit → POST /citations with x-enforcer-id
   ↓
10. Success → Display Citation Number → Reset Form
```

---

## Testing Configuration

### Enforcer ID

For testing purposes, the page includes a test configuration card where you can input an enforcer MongoDB ObjectId:

```typescript
const MOCK_ENFORCER_ID = "68f3135067ba4a165e53ca85";
```

**Note:** In production, this will come from authentication session.

---

## Error Handling

### API Errors

- **Driver Search** - Shows "No drivers found" alert
- **Driver Registration** - Displays validation errors
- **Citation Creation** - Shows error alert with message
- **Network Errors** - Catches and displays generic error

### Validation Errors

- **Step Validation** - Disables "Next" button if step incomplete
- **Form Validation** - HTML5 validation + custom checks
- **Required Fields** - Marked with asterisk (\*)

---

## Success Flow

After successful citation creation:

1. ✅ Success alert displays
2. 📄 Citation number shown (e.g., "TCT-2025-000001")
3. ⏱️ Auto-reset after 3 seconds
4. 🔄 Form clears, returns to Step 1

---

## Data Models

### Driver Interface

```typescript
interface Driver {
  _id: string; // MongoDB ObjectId
  driverID: string; // Auto-generated (e.g., "DRV-2025-000001")
  licenseNo: string; // LTO License Number
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNo: string; // 11-digit phone number
  address?: string; // Full address (deprecated, use nested)
  birthDate?: string; // ISO date string
  status: string; // ACTIVE, SUSPENDED, etc.
}
```

### Violation Interface

```typescript
interface Violation {
  _id: string;
  code: string; // e.g., "R.A. 4136-35(a)"
  title: string;
  description: string;
  fineStructure: "FIXED" | "PROGRESSIVE";

  // Fixed fine structure
  fixedFine?: {
    private: { driver: number; mvOwner: number };
    forHire: { driver: number; operator: number };
  };

  // Progressive fine structure
  progressiveFine?: {
    private: {
      driver: {
        firstOffense: number;
        secondOffense: number;
        thirdOffense: number;
      };
    };
    forHire: {
      driver: {
        firstOffense: number;
        secondOffense: number;
        thirdOffense: number;
      };
    };
  };
}
```

### Citation Form Data

```typescript
interface CitationFormData {
  driverId: string;
  vehicleInfo: {
    plateNo: string;
    vehicleType: "PRIVATE" | "FOR_HIRE";
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
```

---

## Backend Model Alignment

### Citation Model Fields (Backend)

✅ **Fully Implemented:**

- `driverId` - Driver reference
- `vehicleInfo` - Complete vehicle details
- `violationIds` - Converted to violations array by backend
- `location` - Structured address
- `violationDateTime` - ISO date string
- `images` - Array of URLs
- `notes` - Additional information
- `dueDate` - Payment deadline

🔄 **Auto-Populated by Backend:**

- `citationNo` - Auto-generated ticket number
- `issuedBy` - From `x-enforcer-id` header
- `enforcerInfo` - Populated from enforcer record
- `totalAmount` - Calculated from violations
- `amountPaid` - Defaults to 0
- `amountDue` - Same as totalAmount initially
- `status` - Defaults to "PENDING"
- `issuedAt` - Server timestamp

### Driver Model Fields (Backend)

✅ **All Required Fields Implemented:**

- Personal Information (name, sex, birthDate, nationality)
- License Information (licenseNo, expirationDate, agencyCode)
- Contact Information (email, contactNo)
- Address (structured: street, barangay, city, province, postalCode)
- Physical Characteristics (weight, height, bloodType, eyesColor)
- Authentication (password - auto-filled for testing)

---

## Future Enhancements

### Potential Improvements

1. **Image Upload** - Add photo capture for violation evidence
2. **GPS Integration** - Auto-capture coordinates from device
3. **Offline Mode** - Save drafts locally when offline
4. **QR Code Scanning** - Scan driver's license QR code
5. **Print Citation** - Generate PDF receipt
6. **SMS Notification** - Send citation details to driver
7. **Barcode Scanner** - Scan vehicle plate
8. **Voice Input** - Voice-to-text for notes
9. **History** - Show recently created citations
10. **Templates** - Save common violation combinations

---

## Dependencies

```json
{
  "react": "^18.x",
  "date-fns": "^2.x",
  "lucide-react": "^0.x",
  "@/components/ui/*": "shadcn/ui components"
}
```

---

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## Usage

### For Enforcers

1. Navigate to `/citation-test`
2. Search for driver or register new one
3. Fill in vehicle information
4. Record violation location
5. Select applicable violations
6. Review all details
7. Submit citation
8. Receive citation number

### For Developers

1. Ensure backend API is running
2. Configure `NEXT_PUBLIC_API_URL` in `.env.local`
3. Use valid enforcer ObjectId in test configuration
4. Monitor console for API responses
5. Check backend logs for citation creation

---

## Troubleshooting

### Common Issues

**Issue:** "Failed to create citation"

- ✅ Check enforcer ID is valid MongoDB ObjectId
- ✅ Verify backend server is running
- ✅ Ensure driver exists in database
- ✅ Check all required fields are filled

**Issue:** "No drivers found"

- ✅ Verify driver exists in database
- ✅ Check search query spelling
- ✅ Try searching by license number

**Issue:** Driver registration fails

- ✅ Ensure license number is unique
- ✅ Check email is valid and unique
- ✅ Verify contact number is 11 digits
- ✅ Confirm driver is 18+ years old

---

## Technical Notes

### Key Implementation Details

1. **ID Mapping** - Backend returns `id`, frontend maps to `_id`
2. **Date Handling** - All dates converted to ISO strings before submission
3. **Fine Calculation** - Computed client-side for preview, validated server-side
4. **Header Authentication** - Uses `x-enforcer-id` header for testing
5. **Form Reset** - Comprehensive reset function clears all state
6. **Step Validation** - Prevents progression with incomplete data

### Performance Considerations

- **Lazy Loading** - Violations loaded once on mount
- **Debounced Search** - Reduce API calls during typing
- **Conditional Rendering** - Only active step components rendered
- **Memoization** - Consider useMemo for fine calculations

---

## Compliance

This implementation follows:

- ✅ LTO driver license field requirements
- ✅ Philippine address format standards
- ✅ RA 4136 citation documentation requirements
- ✅ Data privacy principles (secure transmission)

---

## License

Part of the eCitationPH system - ETCMF Traffic Management

---

## Version History

- **v1.0** (2025-11-27) - Initial implementation
  - Multi-step wizard interface
  - Driver search and registration
  - Vehicle information capture
  - Location documentation
  - Violation selection with fine calculation
  - Review and submit workflow

---

**Last Updated:** November 27, 2025
