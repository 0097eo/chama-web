"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
    date: DateRange | undefined;
    onDateChange: (date: DateRange | undefined) => void;
}

export function DateRangePicker({ className, date, onDateChange }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDateChange(undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <div className="relative">
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[300px] justify-start text-left font-normal pr-10",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          
          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              onClick={handleReset}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Clear date range</span>
            </Button>
          )}
        </div>

        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
          
          <div className="p-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                onDateChange(undefined);
                setOpen(false);
              }}
              className="w-full"
            >
              Clear Selection
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}