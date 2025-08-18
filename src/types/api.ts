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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Chama and Membership Types
export type MembershipRole = 'ADMIN' | 'TREASURER' | 'SECRETARY' | 'MEMBER';

export interface Membership {
  id: string;
  role: MembershipRole;
  isActive: boolean;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface Chama {
  id: string;
  name: string;
  description: string | null;
  monthlyContribution: number;
  totalMembers: number;
  members: Membership[];
  meetingDay: string;
  // Add other fields as needed
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
  // Add other fields as needed
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
  // Add other fields as needed