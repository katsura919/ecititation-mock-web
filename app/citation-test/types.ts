export interface Driver {
  _id: string;
  driverID: string;
  licenseNo?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
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
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED";
  weight?: number;
  height?: number;
  expirationDate: string;
  bloodType?: string;
  eyesColor?: string;
  dlCodes?: string[];
}

export interface Violation {
  _id: string;
  code: string;
  title: string;
  description: string;
  fineStructure: "FIXED" | "PROGRESSIVE";
  legalReference?: string;
  fixedFine?: {
    private: { driver: number; mvOwner: number };
    forHire: { driver: number; operator: number };
  };
  progressiveFine?: {
    private: {
      driver: {
        firstOffense: number;
        secondOffense?: number;
        thirdOffense?: number;
        subsequentOffense?: number;
      };
      mvOwner: {
        firstOffense: number;
        secondOffense?: number;
        thirdOffense?: number;
        subsequentOffense?: number;
      };
    };
    forHire: {
      driver: {
        firstOffense: number;
        secondOffense?: number;
        thirdOffense?: number;
        subsequentOffense?: number;
      };
      operator: {
        firstOffense: number;
        secondOffense?: number;
        thirdOffense?: number;
        subsequentOffense?: number;
      };
    };
  };
  accessoryPenalty?: string;
  isActive: boolean;
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
  ownerFirstName?: string;
  ownerMiddleName?: string;
  ownerLastName?: string;
  registrationDate?: string;
  expirationDate?: string;
  notes?: string;
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
  ownerFirstName?: string;
  ownerMiddleName?: string;
  ownerLastName?: string;
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
  vehicleId: string;
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
