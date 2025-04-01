import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <RegisterForm />
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Button variant="link" className="p-0" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}
