"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUploadFile } from "@/hooks/useFiles";
import { DialogFooter } from "../ui/dialog";

const formSchema = z.object({
  category: z.string().optional(),
  file: z.instanceof(File, { message: "Please select a file to upload." }),
});

type FormValues = z.infer<typeof formSchema>;

export function FileUploadForm({ chamaId, onSuccess }: { chamaId: string; onSuccess: () => void }) {
    const uploadFileMutation = useUploadFile();
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            category: "document",
            file: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        uploadFileMutation.mutate({ chamaId, ...values }, {
            onSuccess: () => {
                form.reset();
                onSuccess();
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g., receipts, minutes" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>File</FormLabel>
                        <FormControl>
                            <Input
                                type="file"
                                onBlur={field.onBlur}
                                name={field.name}
                                ref={field.ref}
                                onChange={(e) => field.onChange(e.target.files?.[0])}
                                disabled={field.disabled}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button type="submit" disabled={uploadFileMutation.isPending}>
                        {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}