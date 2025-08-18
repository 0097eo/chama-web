"use client";

import { Contribution } from "@/types/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface ContributionTableProps {
  contributions: Contribution[];
}

export function ContributionTable({ contributions }: ContributionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%] pl-4">Member</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Period</TableHead>
          <TableHead>Date Paid</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contributions.map((c) => {

          const memberName = c.membership?.user ? `${c.membership.user.firstName} ${c.membership.user.lastName}` : "Unknown Member";
          const memberInitials = c.membership?.user ? `${c.membership.user.firstName[0]}${c.membership.user.lastName[0]}` : "??";

          return (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{memberInitials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{memberName}</span>
                </div>
              </TableCell>
              <TableCell>KSH {c.amount.toLocaleString()}</TableCell>
              <TableCell>{c.month}/{c.year}</TableCell>
              <TableCell>{c.paidAt ? format(new Date(c.paidAt), "PPP") : 'N/A'}</TableCell>
              <TableCell>
                <Badge variant={c.status === 'PAID' ? 'default' : 'secondary'}>
                  {c.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}