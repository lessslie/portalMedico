// ============================================
// 📁 src/modules/patients/interfaces/patient-response.interface.ts
// ============================================

export interface PatientResponseData {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate: Date;
    insurance?: string;
    isPrimary: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface PatientWithUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    address?: string;
    birthDate: Date;
    insurance?: string;
    isPrimary: boolean;
    user: {
      id: string;
      username: string;
      role: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface MyFamilyResponse {
    primary: PatientResponseData;
    dependents: PatientResponseData[];
  }
  
  export interface CreateDependentResponse {
    message: string;
    dependent: PatientResponseData;
  }