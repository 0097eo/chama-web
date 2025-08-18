"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useBulkImportContributions } from "@/hooks/useContributions";
import { DialogFooter } from "@/components/ui/dialog";

const formSchema = z.object({
  file: z
    .instanceof(File, { message: "A CSV file is required." })
    .refine(
      (file) => file.type === "text/csv" || file.name.endsWith('.csv'),
      { message: "File must be a CSV." }
    )
    .refine(
      (file) => file.size > 0,
      { message: "File cannot be empty." }
    )
    .refine(
      (file) => file.size <= 5 * 1024 * 1024, // 5MB limit
      { message: "File size must be less than 5MB." }
    ),
});

type FormValues = z.infer<typeof formSchema>;

export function BulkImportForm({ chamaId, onSuccess }: { chamaId: string; onSuccess?: () => void }) {
  const bulkImportMutation = useBulkImportContributions();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    try {
      await bulkImportMutation.mutateAsync({ chamaId, file: values.file });
      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Bulk import failed:', error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-800 font-medium mb-2">CSV Format Requirements:</p>
        <p className="text-xs text-blue-700">
          Required headers: <code className="bg-blue-100 px-1 rounded">email, amount, month, year, paymentMethod, paidAt</code>
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Example: <code className="bg-blue-100 px-1 rounded">john@example.com,1000,12,2024,MPESA,2024-12-15</code>
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="file"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <FormItem>
                <FormLabel>Contributions File</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept=".csv,text/csv"
                    name={name}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={bulkImportMutation.isPending}
              className="w-full sm:w-auto"
            >
              {bulkImportMutation.isPending ? "Importing..." : "Import File"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}