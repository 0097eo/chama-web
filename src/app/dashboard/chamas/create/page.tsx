
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useCreateChama } from "@/hooks/useChamas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(3, "Chama name must be at least 3 characters."),
  description: z.string().optional(),
  monthlyContribution: z.coerce.number().positive({ 
    message: "Contribution must be a positive number." 
  }),
  meetingDay: z.string().min(3, "Meeting day description is required."),
  constitution: z.instanceof(File).optional(),
});

type ChamaFormValues = z.infer<typeof formSchema>;

export default function CreateChamaPage() {
  const createChamaMutation = useCreateChama();
  const router = useRouter();

  const form = useForm<ChamaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      meetingDay: "",
      monthlyContribution: 0,
    },
    mode: "onChange",
  });

  const { control, handleSubmit } = form;

  async function onSubmit(values: ChamaFormValues) {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("monthlyContribution", String(values.monthlyContribution));
    formData.append("meetingDay", values.meetingDay);
    if (values.description) formData.append("description", values.description);
    if (values.constitution) formData.append("constitution", values.constitution);
        
    await createChamaMutation.mutateAsync(formData);
    router.push("/dashboard/chamas");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Chama</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField 
              control={control} 
              name="name" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chama Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={control} 
              name="description" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={control} 
              name="monthlyContribution" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Contribution (KSH)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <FormField 
              control={control} 
              name="meetingDay" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Day</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Last Sunday of the month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />

            <Controller
              control={control}
              name="constitution"
              render={({ field: { onChange, name, ref }, fieldState }) => (
                <FormItem>
                  <FormLabel>Constitution (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      name={name}
                      ref={ref}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                      }}
                      accept=".pdf,.doc,.docx"
                    />
                  </FormControl>
                  {fieldState.error && <FormMessage />}
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createChamaMutation.isPending}>
              {createChamaMutation.isPending ? "Creating..." : "Create Chama"}
            </Button>

          </form>
        </Form>
      </CardContent>
    </Card>
  );
}