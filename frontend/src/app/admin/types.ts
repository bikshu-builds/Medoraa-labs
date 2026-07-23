export interface Doctor {
    _id: string;
    doctorCode?: string;
    doctorName: string;
    affiliationType?: 'HOSPITAL' | 'LAB';
    hospitalId?: {
        _id: string;
        hospitalName: string;
        branch?: string;
    } | string;
    labId?: {
        _id: string;
        labName: string;
        hospital?: any;
    } | string;
    labName?: string;
    branch?: string;
    completeAddress?: string;
    degree: string;
    specialization: string;
    referralPercentage: number;
    periodType?: 'WEEKLY' | 'FIFTEEN_DAYS' | 'MONTHLY';
    periodStartDate?: string;
    periodEndDate?: string;
    dateOfBirth?: string;
    gender?: "Male" | "Female" | "Other" | "Prefer not to say";
    mobileNumber: string;
    email: string;
    reportDeliveryMethod: "MAIL" | "WHATSAPP";
    status: "ACTIVE" | "INACTIVE";
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
    payment?: {
        periodType: 'WEEKLY' | 'FIFTEEN_DAYS' | 'MONTHLY';
        periodStartDate: string;
        periodEndDate: string;
        totalReferralAmount: number;
        paidAmount: number;
        dueAmount: number;
        paymentStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
        paymentCompletedDate?: string;
    };
}

export interface DashboardStats {
    totalDoctors: number;
    totalHospitals: number;
    totalAdmins: number;
    totalReferral: number;
    totalPaid: number;
    totalDue: number;
    hospitalDistribution: { name: string; count: number }[];
    topDoctors: { _id: string; name: string; totalEarnings: number; paid: number; due: number }[];
    recentPayments: {
        _id: string;
        doctorName: string;
        hospitalName: string;
        totalReferralAmount: number;
        paidAmount: number;
        dueAmount: number;
        paymentStatus: string;
        createdAt: string;
    }[];
}

export interface Staff {
    _id: string;
    name: string;
    email: string;
    mobileNumber?: string;
    role: "admin" | "registration" | "authorization" | "inventory";
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
}

export interface PatientRegistration {
    _id?: string;
    location: {
        state: string;
        district: string;
        city: string;
    };
    patientName: string;
    age: {
        value: number;
        type: "Years" | "Months" | "Days";
    };
    gender: "Male" | "Female" | "Other";
    mobileNumber: string;
    address: string;
    referredBy: string;
    sampleDrawnBy?: string;
    sampleReceived: {
        receivedThrough: "Employee" | "Person" | "Courier" | "Bus";
        employee?: {
            name: string;
            id: string;
            mobileNumber: string;
            department: string;
            designation: string;
            dateReceived: string;
            timeReceived: string;
            remarks: string;
        };
        person?: {
            name: string;
            mobileNumber: string;
            relationship: string;
            address: string;
            idProofType: string;
            idProofNumber: string;
            dateReceived: string;
            timeReceived: string;
            remarks: string;
        };
        courier?: {
            companyName: string;
            trackingNumber: string;
            orderNumber: string;
            contactNumber: string;
            pickupLocation: string;
            arrivalDate: string;
            arrivalTime: string;
            receivedByEmployee: string;
            packageCondition: "Good" | "Damaged" | "Opened" | "";
            remarks: string;
        };
        bus?: {
            busNumber: string;
            busServiceName: string;
            driverName: string;
            driverMobileNumber: string;
            conductorName: string;
            conductorMobileNumber: string;
            originLocation: string;
            destinationLocation: string;
            arrivalDate: string;
            arrivalTime: string;
            receivedByEmployee: string;
            packageCondition: string;
            remarks: string;
        };
    };
    registrationDate: string;
    registrationTime: string;
    registrationNumber: string;
    tests?: any[];
    createdAt?: string;
}

