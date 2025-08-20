"use client";

import { useState, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format } from 'date-fns/format';
import { parse } from 'date-fns/parse';
import { startOfWeek } from 'date-fns/startOfWeek';
import { getDay } from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Meeting } from '@/types/api';
import { useRouter } from 'next/navigation';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

interface MeetingCalendarProps {
    meetings: Meeting[];
}

export function MeetingCalendar({ meetings }: MeetingCalendarProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    
    const events: CalendarEvent[] = meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        start: new Date(meeting.scheduledFor),
        end: new Date(new Date(meeting.scheduledFor).getTime() + 60 * 60 * 1000), // Assume 1hr
    }));

    const handleNavigate = useCallback((newDate: Date) => {
        setCurrentDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView: View) => {
        setCurrentView(newView);
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        router.push(`/dashboard/meetings/${event.id}`);
    }, [router]);

    return (
        <div className="h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                view={currentView}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                onSelectEvent={handleSelectEvent}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                popup
                showMultiDayTimes
            />
        </div>
    );
}