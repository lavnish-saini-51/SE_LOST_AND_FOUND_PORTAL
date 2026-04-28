import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { http } from "../api/http";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import { emitLostResolved } from "../lib/events";

function StatusPill({ status }) {
  const map = {
    pending: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-200",
    approved: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200",
    rejected: "border-rose-500/30 bg-rose-500/15 text-rose-700 dark:text-rose-200"
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${map[status] || ""}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("lost");

  const tabs = useMemo(
    () => [
      { id: "lost", label: "My Lost Items" },
      { id: "found", label: "My Found Items" },
      { id: "notifications", label: "Notifications" },
      { id: "claims", label: "Claimed Items" }
    ],
    []
  );

  async function refresh() {
    try {
      setLoading(true);
      const { data: d } = await http.get("/api/user/dashboard");
      setData(d);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markFound(id) {
    try {
      await http.post(`/api/lost/${id}/mark-found`);
      toast.success("Item marked as found.");
      emitLostResolved();
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Action failed");
    }
  }

  async function acceptClaim(claimId) {
    try {
      await http.post(`/api/claims/${claimId}/accept`);
      toast.success("Item marked as found.");
      emitLostResolved();
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Action failed");
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass h-36 rounded-2xl animate-pulse" />
        ))}
        <div className="glass h-80 rounded-2xl md:col-span-3 animate-pulse" />
      </div>
    );
  }

  const stats = data?.stats;
  const lostItems = data?.lostItems || [];
  const foundItems = data?.foundItems || [];
  const notifications = data?.notifications || [];
  const claims = data?.claims || [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Lost posts</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.lostCount ?? 0}</div>
        </Card>
        <Card className="rounded-2xl">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Found posts</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.foundCount ?? 0}</div>
        </Card>
        <Card className="rounded-2xl">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Unread notifications</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.unreadNotifications ?? 0}</div>
        </Card>
        <Card className="rounded-2xl">
          <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Claims</div>
          <div className="mt-1 text-2xl font-semibold">{stats?.claimsCount ?? 0}</div>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "rounded-full border px-3 py-1 text-xs font-semibold transition " +
                (tab === t.id
                  ? "border-indigo-500/30 bg-indigo-500/15 text-indigo-700 dark:text-cyan-200"
                  : "border-white/20 bg-white/20 text-slate-700 hover:bg-white/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10")
              }
            >
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={refresh}>
              Refresh
            </Button>
            <Link to="/report/lost">
              <Button>New post</Button>
            </Link>
          </div>
        </div>

        <div className="mt-4">
          {tab === "lost" ? (
            lostItems.length ? (
              <div className="space-y-3">
                {lostItems.filter((x) => !x.resolved && !x.isResolved).map((it) => (
                  <div key={it._id} className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/20 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">{it.itemName}</div>
                        <StatusPill status={it.status} />
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{it.lastSeenLocation}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/items/${it._id}`}>
                        <Button variant="secondary">View</Button>
                      </Link>
                      <Button variant="secondary" disabled={it.resolved} onClick={() => markFound(it._id)}>
                        Mark found
                      </Button>
                    </div>
                  </div>
                ))}

                {lostItems.some((x) => x.resolved || x.isResolved) ? (
                  <div className="pt-2">
                    <div className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Resolved</div>
                    <div className="space-y-3">
                      {lostItems
                        .filter((x) => x.resolved || x.isResolved)
                        .map((it) => (
                          <div
                            key={it._id}
                            className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/10 p-4 opacity-85 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <div className="truncate text-sm font-semibold">{it.itemName}</div>
                                <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
                                  Found
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{it.lastSeenLocation}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link to={`/items/${it._id}`}>
                                <Button variant="secondary">View</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300">No lost items yet.</div>
            )
          ) : null}

          {tab === "found" ? (
            foundItems.length ? (
              <div className="space-y-3">
                {foundItems.map((it) => (
                  <div key={it._id} className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/20 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-semibold">{it.itemName}</div>
                        <StatusPill status={it.status} />
                      </div>
                      <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">{it.foundLocation}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/items/${it._id}`}>
                        <Button variant="secondary">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300">No found items yet.</div>
            )
          ) : null}

          {tab === "notifications" ? (
            notifications.length ? (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={
                      "rounded-xl border p-4 " +
                      (n.read
                        ? "border-white/20 bg-white/15 dark:border-white/10 dark:bg-white/5"
                        : "border-indigo-500/30 bg-indigo-500/10 dark:bg-cyan-500/10")
                    }
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold">{n.title}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-200">{n.message}</div>
                    {n.meta?.lostItemId ? (
                      <div className="mt-2">
                        <Link to={`/items/${n.meta.lostItemId}`}>
                          <Button variant="secondary">Open item</Button>
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300">No notifications yet.</div>
            )
          ) : null}

          {tab === "claims" ? (
            claims.length ? (
              <div className="space-y-3">
                {claims.map((c) => (
                  <div key={c._id} className="rounded-xl border border-white/20 bg-white/15 p-4 dark:border-white/10 dark:bg-white/5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold">Claim: {c.status}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">{new Date(c.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700 dark:text-slate-200">{c.message}</div>
                    <div className="mt-2">
                      <Link to={`/items/${c.lostItem}`}>
                        <Button variant="secondary">Open lost item</Button>
                      </Link>
                    </div>
                    {String(c.owner) === String(user?.id) && c.status === "pending" ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => acceptClaim(c._id)}>Accept claim</Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300">No claims yet.</div>
            )
          ) : null}
        </div>
      </Card>
    </div>
  );
}
