import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegister } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = useRegister();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await register.mutateAsync({ email, password, full_name: fullName });
      navigate("/login");
    } catch {
      // error surfaced below via register.isError
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/ecosphere-logo.svg" alt="EcoSphere Logo" className="h-14 w-auto mx-auto mb-2" />
          <h1 className="font-display font-semibold text-lg text-neutral-800 dark:text-neutral-200">Create your account</h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {register.isError && (
            <p className="text-sm text-critical-red">Registration failed. Email may already be in use.</p>
          )}
          <Button type="submit" disabled={register.isPending} className="w-full">
            {register.isPending ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="text-center text-sm text-neutral-500 mt-4">
          Already have an account? <Link to="/login" className="text-eco-green font-medium">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
