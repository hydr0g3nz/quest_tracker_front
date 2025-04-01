"use client";
import { useAuth } from "@/contexts/auth-context";
import { LoginCredentials, UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const loginFormSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(UserRole.Adventurer);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(values, role);
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to login. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Welcome Back</h1>
        <p className="text-muted-foreground">
          Login to continue your adventure or manage your quests
        </p>
      </div>

      <Tabs
        defaultValue="adventurer"
        onValueChange={(value) =>
          setRole(
            value === "adventurer"
              ? UserRole.Adventurer
              : UserRole.GuildCommander
          )
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="adventurer">Adventurer</TabsTrigger>
          <TabsTrigger value="guild-commander">Guild Commander</TabsTrigger>
        </TabsList>
        <TabsContent value="adventurer">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Login as an adventurer to join quests
          </div>
          <LoginFormFields
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
        <TabsContent value="guild-commander">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Login as a guild commander to manage quests
          </div>
          <LoginFormFields
            form={form}
            onSubmit={onSubmit}
            isLoading={isLoading}
            error={error}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoginFormFields({
  form,
  onSubmit,
  isLoading,
  error,
}: {
  form: any;
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your username"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="text-sm font-medium text-destructive">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
