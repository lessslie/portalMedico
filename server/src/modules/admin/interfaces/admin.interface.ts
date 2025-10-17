// src/modules/admin/interfaces/admin.interface.ts

export interface DoctorCreatedResponse {
    message: string;
    doctor: {
      id: string;
      firstName: string;
      lastName: string;
      specialty: string;
      licenseNumber: string;
      phone?: string;
      user: {
        id: string;
        username: string;
        role: string;
        isActive: boolean;
      };
    };
    activationEmailSent: boolean;
  }
  
  export interface PendingDoctorResponse {
    id: string;
    firstName: string;
    lastName: string;
    specialty: string;
    licenseNumber: string;
    email: string;
    createdAt: Date;
    daysPending: number;
  }
  
  export interface PendingDoctorsListResponse {
    message: string;
    total: number;
    pendingDoctors: PendingDoctorResponse[];
  }