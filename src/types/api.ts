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