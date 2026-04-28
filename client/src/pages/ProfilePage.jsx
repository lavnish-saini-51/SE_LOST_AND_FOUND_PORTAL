import React from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();

  async function refresh() {
    await refreshMe();
    toast.success("Profile refreshed");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="rounded-2xl">
        <div className="text-lg font-semibold">Profile</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Name</div>
            <div className="mt-1 text-sm font-semibold">{user?.name}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email</div>
            <div className="mt-1 text-sm font-semibold">{user?.email}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Role</div>
            <div className="mt-1 text-sm font-semibold">{user?.role}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Member since</div>
            <div className="mt-1 text-sm font-semibold">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl">
        <div className="text-sm font-semibold">Profile Settings</div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Basic profile editing can be added on top of the existing secure auth flow.
        </div>
      </Card>
    </div>
  );
}

