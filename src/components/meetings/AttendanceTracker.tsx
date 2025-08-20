"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { format } from 'date-fns';
import { CheckCircle2, QrCode, UserPlus } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useGetQrCode, useMarkMyAttendance, useGetAttendanceList } from '@/hooks/useMeetings';

export function AttendanceTracker({ meetingId }: { meetingId: string }) {
    const [showQrCode, setShowQrCode] = useState(false);
    
    const { data: qrCodeData, isLoading: isQrLoading } = useGetQrCode(meetingId);
    const { data: attendanceList = [], isLoading: isAttendanceLoading } = useGetAttendanceList(meetingId);
    const markAttendanceMutation = useMarkMyAttendance();

    const handleMarkAttendance = () => {
        markAttendanceMutation.mutate(meetingId);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Attendance Tracker
                </CardTitle>
                <CardDescription>
                    Mark your attendance or display QR code for members to scan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                <div className="flex flex-wrap gap-2">
                    <Button 
                        onClick={handleMarkAttendance}
                        disabled={markAttendanceMutation.isPending}
                        className="flex items-center gap-2"
                        variant="default"
                    >
                        <UserPlus className="h-4 w-4" />
                        {markAttendanceMutation.isPending ? "Marking..." : "Mark My Attendance"}
                    </Button>
                    
                    <Button 
                        onClick={() => setShowQrCode(!showQrCode)}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <QrCode className="h-4 w-4" />
                        {showQrCode ? "Hide" : "Show"} QR Code
                    </Button>
                </div>

                {showQrCode && (
                    <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2">
                            <QrCode className="h-4 w-4" /> 
                            Attendance QR Code
                        </h3>
                        <div className="flex justify-center items-center p-4 border rounded-md min-h-[220px] bg-gray-50">
                            {isQrLoading && <Skeleton className="h-48 w-48" />}
                            {qrCodeData?.qrCodeDataUrl && (
                                <div className="text-center">
                                    <Image
                                        src={qrCodeData.qrCodeDataUrl}
                                        alt="Meeting Attendance QR Code"
                                        width={200}
                                        height={200}
                                        className="mx-auto mb-2"
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Scan with your device to mark attendance
                                    </p>
                                </div>
                            )}
                            {!isQrLoading && !qrCodeData?.qrCodeDataUrl && (
                                <p className="text-muted-foreground">Unable to generate QR code</p>
                            )}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="font-semibold mb-2">
                        Attendees ({attendanceList.length})
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {isAttendanceLoading && <Skeleton className="h-24 w-full" />}
                        {attendanceList.length > 0 ? (
                            attendanceList.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-md bg-green-50 border-green-200">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-green-100 text-green-700">
                                            {item.membership.user.firstName[0]}{item.membership.user.lastName[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">
                                            {item.membership.user.firstName} {item.membership.user.lastName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Checked in at {format(new Date(item.attendedAt), 'p')} on {format(new Date(item.attendedAt), 'MMM dd')}
                                        </p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                <p className="text-muted-foreground">No members have checked in yet.</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Be the first to mark your attendance!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}