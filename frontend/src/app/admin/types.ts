export interface Doctor {
    _id: string;
    name: string;
    hospitalName: string;
    branch: string;
    phoneNumber: string;
    email: string;
    commissionPercentage: number;
    specialty?: string;
    registrationNumber?: string;
    status: 'active' | 'inactive';
    preferredCommunication: 'Email' | 'WhatsApp' | 'SMS';
    referralCategory: 'General' | 'Specialist' | 'Corporate';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    _id: string;
    staffId: string;
    name: string;
    role: "Sample Collection Team" | "Sample Processing Team" | "Report Approval Team" | "Dispatch Team" | "Reception" | "Admin Staff" | "Lab Staff" | "Marketing Team" | "Home Collection Staff" | "Admin";
    email: string;
    phoneNumber: string;
    password?: string;
    address?: string;
    profileImage?: string;
    joiningDate: string;
    status: "active" | "inactive" | "Active" | "Inactive";
}

export interface Patient {
    _id: string;
    patientId: string;
    name: string;
    phoneNumber: string;
    password?: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    sourceType: 
        | 'Walk-in' 
        | 'Referring Doctor' 
        | 'Home Collection' 
        | 'Corporate / Camps'
        | 'Online Booking'
        | 'Insurance Partner'
        | 'Marketing Campaign'
        | 'Repeat Patient'
        | 'Hospital Tie-up'
        | 'Diagnostic Package Campaign';
    doctorReferral?: Doctor | string;
    corporateDetails?: {
        corporateName?: string;
        campName?: string;
        campId?: string;
        hrCoordinator?: string;
        bulkUploadId?: string;
        corporateDiscount?: number;
        billingAccount?: string;
        contractValidity?: string;
    };
    testStatus: 'Pending' | 'Sample Collected' | 'Processing' | 'Completed';
    revenue: number;
    date: string;
}

export interface HomeCollection {
    _id: string;
    patient: Patient;
    assignedStaff: Employee;
    gpsLocation?: {
        lat: number;
        lng: number;
    };
    selfieProof?: string;
    status: 'Scheduled' | 'In Progress' | 'Collected' | 'Cancelled';
    collectionDate: string;
}

export interface Commission {
    _id: string;
    doctor: Doctor;
    patientCount: number;
    commissionPercentage: number;
    totalCommission: number;
    month: string;
    status: 'Unpaid' | 'Paid';
}

export interface DashboardStats {
    totalPatients: number;
    totalDoctors: number;
    totalEmployees: number;
    homeCollectionRequests: number;
    monthlyRevenue: number;
    pendingReports: number;
    sourceCounts: { _id: string; count: number }[];
}
