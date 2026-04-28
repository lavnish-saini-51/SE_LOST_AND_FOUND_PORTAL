import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await register({ name, email, password });
      toast.success("Account created");
      nav("/dashboard");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-2xl">
        <div className="text-lg font-semibold">Register</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Create an account to post items and contact owners.
        </div>
        <form onSubmit={onSubmit} className="mt-5 space-y-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            hint="Minimum 8 characters"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-xs text-slate-600 dark:text-slate-300">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-indigo-600 dark:text-cyan-300">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
}

