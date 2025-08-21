// Generic type for paginated API responses
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

// User and Auth Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

// Chama and Membership Types
export type MembershipRole = 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';

export interface Membership {
  id: string;
  role: MembershipRole;
  isActive: boolean;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
  chamaId: string;
}

export interface Chama {
  id: string;
  name: string;
  description: string | null;
  monthlyContribution: number;
  totalMembers: number;
  members: Membership[];
  meetingDay: string;
}

// Contribution Types
export type ContributionStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Contribution {
  id: string;
  amount: number;
  month: number;
  year: number;
  status: ContributionStatus;
  paidAt: string | null;
  membershipId: string;
  membership: {
      user: {
          firstName: string;
          lastName: string;
      }
  };
}

// Loan Types
export type LoanStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'PAID' | 'DEFAULTED';

export interface LoanPayment {
    id: string;
    amount: number;
    paidAt: string;
    paymentMethod: string;
}

export interface Loan {
    id: string;
    amount: number;
    interestRate: number;
    duration: number;
    purpose: string;
    status: LoanStatus;
    appliedAt: string;
    approvedAt: string | null;
    disbursedAt: string | null;
    dueDate: string | null;
    repaymentAmount: number | null;
    monthlyInstallment: number | null;
    membershipId: string;
    membership: Membership;
    payments: LoanPayment[];
}

// Reports Types

export interface FinancialSummary {
    totalContributions: number;
    totalPenalties: number;
    totalLoansDisbursed: number;
    totalLoanRepayments: number;
    outstandingLoanPrincipal: number;
    netPosition: number;
}

// This can reuse the generic PaginatedResponse
export type ContributionsReport = PaginatedResponse<Contribution>;

export interface LoanPortfolioReport {
    totalPrincipalDisbursed: number;
    totalRepayments: number;
    statusBreakdown: {
        status: LoanStatus;
        count: number;
        totalAmount: number;
    }[];
}


export interface MemberPerformanceData {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  _count: {
    contributions: number;
    loans: number;
  };
  contributions: {
    amount: number;
  }[];
  loans: {
    amount: number;
    status: LoanStatus;
  }[];
}

export interface ProcessedMemberPerformance {
  membershipId: string;
  name: string;
  email: string;
  totalContributions: number;
  contributionCount: number;
  totalLoanPrincipal: number;
  loanCount: number;
  activeLoansCount: number;
}


// Dashboard Types
export interface ChamaDashboardStats {
  totalContributionsThisYear: number;
  activeLoansCount: number;
  totalLoanAmountActive: number;
  totalMembers: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  target: {
    email: string;
  } | null;
  chama: {
    name: string;
  } | null;
}

// Mpesa transaction types
export interface MpesaTransaction {
    id: string;
    type: 'Contribution' | 'Disbursement';
    amount: number;
    status: string;
    mpesaCode: string | null;
    date: string;
    memberName: string;
    month?: number;
    year?: number;
    penaltyApplied?: number;
    purpose?: string;
    interestRate?: number;
    duration?: number;
}

// Meeting types
export type MeetingStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface MeetingAttendance {
    id: string;
    attendedAt: string;
    membership: {
        user: {
            firstName: string;
            lastName: string;
        }
    }
}

export interface Meeting {
    id: string;
    title: string;
    agenda: string;
    scheduledFor: string;
    location: string;
    status: MeetingStatus;
    minutes: string | null;
    chamaId: string;
    attendance: MeetingAttendance[];
}

// File Types
export interface File  {
  id: string;
  filename: string;
  url: string;
  publicId: string;
  fileType: string;
  size: number;
  category: string;
  uploadedAt: string;
  chamaId: string;
  uploaderId: string | null;
  uploader?: { // The uploader might be null if the user was deleted
    firstName: string;
    lastName: string;
  } | null;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string; // e.g 'GENERAL', 'MEETING_REMINDER'
  read: boolean;
  createdAt: string;
  userId: string;
}