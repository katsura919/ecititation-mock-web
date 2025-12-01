export interface Driver {
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

export interface Violation {
  _id: string;
  code: string;
  title: string;
  description: string;
  fineStructure: "FIXED" | "PROGRESSIVE";
  fixedFine?: {
    private: { driver: number; mvOwner: number };
    forHire: { driver: number; operator: number };
  };
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

export interface Vehicle {
  _id: string;
  plateNo: string;
  vehicleType: "PRIVATE" | "FOR_HIRE" | "GOVERNMENT" | "DIPLOMATIC";
  classification?: string;
  make?: string;
  vehicleModel?: string;
  year?: number;
  color?: string;
  bodyMark?: string;
  registeredOwner?: string;
  ownerId?: string;
  status: string;
}

export interface VehicleOwner {
  _id: string;
  vehicleOwnerID: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  status: string;
}

export interface NewVehicleFormData {
  plateNo: string;
  vehicleType: "PRIVATE" | "FOR_HIRE" | "GOVERNMENT" | "DIPLOMATIC";
  classification?: string;
  make?: string;
  vehicleModel?: string;
  year?: number;
  color?: string;
  bodyMark?: string;
  registeredOwner?: string;
  owner: {
    firstName: string;
    middleName?: string;
    lastName: string;
    driverId?: string;
  };
}

export interface NewDriverFormData {
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
  sex: "MALE" | "FEMALE";
  weight?: number;
  height?: number;
  expirationDate: string;
  agencyCode?: string;
  bloodType?: string;
  conditions?: string;
  eyesColor?: string;
  dlCodes?: string[];
}

export interface CitationFormData {
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

export interface SubmitStatus {
  type: "success" | "error" | null;
  message: string;
  citationNo?: string;
}
