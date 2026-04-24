export interface Doctor {
    _id: string;
    name: string;
    hospitalName: string;
    branch: string;
    phoneNumber: string;
    email: string;
    commissionPercentage: number;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    phoneNumber: string;
    email: string;
    role: 'Lab Staff' | 'Marketing Team' | 'Home Collection Staff';
    address?: string;
    profileImage?: string;
    joiningDate: string;
    status: 'active' | 'inactive';
}

export interface Patient {
    _id: string;
    patientId: string;
    name: string;
    phoneNumber: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    sourceType: 'Walk-in' | 'Referring Doctor' | 'Home Collection' | 'Corporate / Camps';
    doctorReferral?: Doctor | string;
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
