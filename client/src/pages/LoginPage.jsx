import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await login({ email, password });
      toast.success("Welcome back");
      nav(from, { replace: true });
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-2xl">
        <div className="text-lg font-semibold">Login</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Access your dashboard and notifications.</div>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
          New here?{" "}
          <Link to="/register" className="font-semibold text-indigo-600 dark:text-cyan-300">
            Create an account
          </Link>
        </div>
      </Card>
    </div>
  );
}

