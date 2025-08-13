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
  members: Membership[];
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
  // Add other fields as needed
}

// Add other types for Loan, Meeting, File, etc. as you build those features.