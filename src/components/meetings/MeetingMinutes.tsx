"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '../ui/button';
import { useSaveMeetingMinutes } from '@/hooks/useMeetings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

const TiptapMenuBar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;
    return (
        <div className="flex flex-wrap gap-2 p-2 border-b rounded-t-md bg-muted/50">
            <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="sm">Bold</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="sm">Italic</Button>
            <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="sm">List</Button>
        </div>
    );
};

interface MeetingMinutesProps {
    meetingId: string;
    initialContent?: string | null;
    isPrivileged: boolean;
}

export function MeetingMinutes({ meetingId, initialContent, isPrivileged }: MeetingMinutesProps) {
    const saveMinutesMutation = useSaveMeetingMinutes();
        
    const editor = useEditor({
        extensions: [StarterKit],
        content: initialContent || '<p>No minutes have been recorded for this meeting yet.</p>',
        editable: isPrivileged,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none min-h-[200px] w-full rounded-b-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-4',
            },
        },
    });

    const handleSave = () => {
        const html = editor?.getHTML();
        if (html) {
            saveMinutesMutation.mutate({ meetingId, minutes: html });
        }
    };

    if (!editor) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Meeting Minutes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Meeting Minutes</CardTitle>
                <CardDescription>
                    {isPrivileged 
                        ? "Record the key decisions and discussion points from the meeting."
                        : "A record of the key decisions and discussion points from the meeting."
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isPrivileged && <TiptapMenuBar editor={editor} />}
                
                <EditorContent editor={editor} />
                
                {isPrivileged && (
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleSave} disabled={saveMinutesMutation.isPending}>
                            {saveMinutesMutation.isPending ? "Saving..." : "Save Minutes"}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}