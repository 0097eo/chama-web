"use client";

import { createContext, useState, useContext, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';

interface ReportsContextType {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const value = {
    dateRange,
    setDateRange,
  };

  return (
      <ReportsContext.Provider value={value}>
          {children}
      </ReportsContext.Provider>
  );
}

export function useReportsContext() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error('useReportsContext must be used within a ReportsProvider');
  }
  return context;
}