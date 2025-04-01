import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const questFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Quest name must be at least 3 characters" })
    .max(255, { message: "Quest name cannot exceed 255 characters" }),
  description: z
    .string()
    .max(1000, { message: "Description cannot exceed 1000 characters" })
    .optional(),
});

type QuestFormValues = z.infer<typeof questFormSchema>;

interface QuestFormProps {
  initialValues?: {
    name: string;
    description?: string;
  };
  onSubmit: (values: QuestFormValues) => void;
  isLoading?: boolean;
}

export function QuestForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: QuestFormProps) {
  const form = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: initialValues || {
      name: "",
      description: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quest Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter quest name" disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Give your quest a descriptive name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter quest details"
                  className="min-h-32"
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Provide details about the quest, objectives, rewards, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialValues ? "Update Quest" : "Create Quest"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
