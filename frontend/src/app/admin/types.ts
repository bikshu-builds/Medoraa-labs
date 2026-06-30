export interface Doctor {
    _id: string;
    doctorCode?: string;
    doctorName: string;
    hospitalId?: {
        _id: string;
        hospitalName: string;
        branch?: string;
    } | string;
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
