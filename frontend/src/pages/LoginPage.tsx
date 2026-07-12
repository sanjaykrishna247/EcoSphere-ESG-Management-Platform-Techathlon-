import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLogin } from "@/api/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Globe } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      navigate("/");
    } catch {
      // error surfaced below via login.isError
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Globe className="w-10 h-10 text-eco-green mx-auto" />
          <h1 className="font-display font-bold text-xl mt-2">EcoSphere</h1>
          <p className="text-sm text-neutral-500">ESG Management Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@ecosphere.com"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          {login.isError && (
            <p className="text-sm text-critical-red">Invalid email or password.</p>
          )}
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-sm text-neutral-500 mt-4">
          Don't have an account? <Link to="/register" className="text-eco-green font-medium">Register</Link>
        </p>
      </Card>
    </div>
  );
}
