import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { http } from "../api/http";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { Link } from "react-router-dom";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  async function load() {
    try {
      setLoading(true);
      const { data } = await http.get("/api/notify");
      setNotifications(data.notifications || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    try {
      await http.patch(`/api/notify/${id}/read`);
      setNotifications((ns) => ns.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch {
      toast.error("Failed to mark read");
    }
  }

  async function markAll() {
    try {
      await http.patch("/api/notify/read-all");
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card className="rounded-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Notifications</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Matches, claims, and updates.</div>
          </div>
          <Button variant="secondary" onClick={markAll} disabled={!notifications.length}>
            Mark all read
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="glass h-64 rounded-2xl animate-pulse" />
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n._id} className={`rounded-2xl ${n.read ? "opacity-85" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold">{n.title}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {n.type === "claim" && n.meta?.finder ? (
                <div className="mt-3 rounded-xl border border-white/20 bg-white/15 p-4 dark:border-white/10 dark:bg-white/5">
                  <div className="text-sm font-semibold">{n.meta?.finder?.name || "Finder"}</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Item: {n.meta?.itemName || "—"}</div>
                  <div className="mt-3 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <div>
                      Phone:{" "}
                      {n.meta?.finder?.phone ? (
                        <a className="font-semibold underline" href={`tel:${n.meta.finder.phone}`}>
                          {n.meta.finder.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div>
                      Email:{" "}
                      {n.meta?.finder?.email ? (
                        <a className="font-semibold underline" href={`mailto:${n.meta.finder.email}`}>
                          {n.meta.finder.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">
                      Message: <span className="font-semibold">{n.meta?.claim?.message || "—"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const email = n.meta?.finder?.email;
                        if (email) window.location.href = `mailto:${email}`;
                      }}
                      disabled={!n.meta?.finder?.email}
                    >
                      Contact Finder
                    </Button>
                    {n.meta?.lostItemId ? (
                      <Link to={`/items/${n.meta.lostItemId}`}>
                        <Button variant="secondary">View Item</Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{n.message}</div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {n.meta?.lostItemId ? (
                  <Link to={`/items/${n.meta.lostItemId}`}>
                    <Button variant="secondary">Open item</Button>
                  </Link>
                ) : null}
                {!n.read ? (
                  <Button variant="secondary" onClick={() => markRead(n._id)}>
                    Mark read
                  </Button>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="rounded-2xl">
          <div className="text-sm font-semibold">No notifications</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            When someone posts a likely match, you will see it here.
          </div>
        </Card>
      )}
    </div>
  );
}
