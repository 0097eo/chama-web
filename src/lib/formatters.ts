import { AuditLog } from "@/types/api";

/**
 * Formats an AuditLog object into a human-readable activity string.
 * @param activity - The audit log record from the API.
 * @returns A user-friendly string describing the action.
 */
export function formatActivityLog(activity: AuditLog): string {
    const actor = `${activity.user.firstName} ${activity.user.lastName.charAt(0)}.`;
    const targetUser = activity.target ? `${activity.target.email}` : 'a user';
    const chama = activity.chama ? activity.chama.name : 'the chama';

    switch (activity.action) {
        // User Management
        case 'USER_UPDATE': return `${actor} updated the profile of ${targetUser}.`;
        case 'USER_DELETE': return `${actor} deleted the user ${targetUser}.`;

        // Chama Management
        case 'CHAMA_UPDATE': return `${actor} updated the information for ${chama}.`;
        case 'CHAMA_DELETE': return `${actor} deleted the chama: ${chama}.`;
        case 'CHAMA_MEMBER_ADD': return `${actor} added ${targetUser} to ${chama}.`;
        case 'CHAMA_MEMBER_REMOVE': return `${actor} removed ${targetUser} from ${chama}.`;
        case 'CHAMA_MEMBER_ROLE_UPDATE': return `${actor} updated the role for ${targetUser}.`;
        
        // Contribution Management
        case 'CONTRIBUTION_CREATE': return `${actor} recorded a new contribution.`;
        case 'CONTRIBUTION_UPDATE': return `${actor} updated a contribution record.`;
        case 'CONTRIBUTION_DELETE': return `${actor} deleted a contribution record.`;

        // Loan Management
        case 'LOAN_APPLY': return `${actor} applied for a new loan.`;
        case 'LOAN_APPROVE': return `${actor} approved a loan application.`;
        case 'LOAN_REJECT': return `${actor} rejected a loan application.`;
        case 'LOAN_DISBURSE': return `${actor} disbursed a loan.`;
        case 'LOAN_REPAYMENT': return `${actor} recorded a loan repayment.`;
        case 'LOAN_RESTRUCTURE': return `${actor} restructured a loan.`;
        
        // Meeting Management
        case 'MEETING_SCHEDULE': return `${actor} scheduled a new meeting.`;
        case 'MEETING_UPDATE': return `${actor} updated a meeting's details.`;
        case 'MEETING_CANCEL': return `${actor} cancelled a meeting.`;
        case 'MEETING_ATTENDANCE_MARK': return `${actor} marked their attendance.`;
        case 'MEETING_MINUTES_SAVE': return `${actor} saved the minutes for a meeting.`;

        // Default fallback for any unhandled actions
        default: return `${actor} performed action: ${activity.action}`;
    }
}