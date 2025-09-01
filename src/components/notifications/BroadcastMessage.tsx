"use client";

import { useState } from 'react';
import { useBroadcastMessage } from '@/hooks/useNotifications';
import { useChamaContext } from '@/context/ChamaContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Megaphone, AlertCircle } from 'lucide-react';

export const BroadcastMessage = () => {
    const { activeChama } = useChamaContext();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    
    const broadcastMutation = useBroadcastMessage();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!activeChama || !title.trim() || !message.trim()) {
            return;
        }

        broadcastMutation.mutate(
            {
                chamaId: activeChama.id,
                title: title.trim(),
                message: message.trim(),
            },
            {
                onSuccess: () => {
                    setTitle('');
                    setMessage('');
                }
            }
        );
    };

    if (!activeChama) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Please select a chama to send broadcast messages.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" />
                    Broadcast Message
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Send a message to all members of {activeChama.name}
                </p>
            </CardHeader>
            
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="broadcast-title">Title *</Label>
                        <Input
                            id="broadcast-title"
                            placeholder="Enter message title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            maxLength={100}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            {title.length}/100 characters
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="broadcast-message">Message *</Label>
                        <Textarea
                            id="broadcast-message"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            maxLength={500}
                            rows={4}
                            className="w-full resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                            {message.length}/500 characters
                        </p>
                    </div>

                    {/* Preview */}
                    {(title.trim() || message.trim()) && (
                        <div className="border rounded-lg p-3 bg-muted/30">
                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                            <div className="space-y-1">
                                {title.trim() && (
                                    <h4 className="font-medium text-sm">{title}</h4>
                                )}
                                {message.trim() && (
                                    <p className="text-sm text-muted-foreground">{message}</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                            This message will be sent to all active members via:
                            <div className="flex items-center gap-4 mt-1 text-xs">
                                <span className="flex items-center gap-1">
                                    🔔 App notification
                                </span>
                                <span className="flex items-center gap-1">
                                    📱 SMS (if enabled)
                                </span>
                            </div>
                        </div>
                        
                        <Button 
                            type="submit"
                            disabled={
                                !title.trim() || 
                                !message.trim() || 
                                broadcastMutation.isPending
                            }
                            className="min-w-[120px]"
                        >
                            {broadcastMutation.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Send className="h-4 w-4" />
                                    Send Broadcast
                                </div>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};