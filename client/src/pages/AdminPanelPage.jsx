import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Select from "../components/ui/Select.jsx";
import { http } from "../api/http";

function ItemRow({ item, type, onApprove, onReject, onDelete }) {
  const who = type === "lost" ? item.owner : item.finder;
  const title = `${item.itemName} (${type})`;
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/15 p-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Status: {item.status} · By: {who?.name || "—"} ({who?.email || "—"})
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onApprove}>
          Approve
        </Button>
        <Button variant="secondary" onClick={onReject}>
          Reject
        </Button>
        <Button variant="secondary" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState({ lost: [], found: [] });
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  const counts = useMemo(
    () => ({
      users: users.length,
      pending: (items.lost || []).length + (items.found || []).length
    }),
    [users, items]
  );

  async function load() {
    try {
      setLoading(true);
      const [u, it] = await Promise.all([
        http.get("/api/admin/users"),
        http.get("/api/admin/items", { params: { type: "all", status } })
      ]);
      setUsers(u.data.users || []);
      setItems(it.data.items || { lost: [], found: [] });
    } catch (e) {
      toast.error(e?.response?.data?.message || "Admin load failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function setItemStatus(type, id, nextStatus) {
    await http.patch(`/api/admin/items/${type}/${id}/status`, { status: nextStatus });
  }

  async function deleteItem(type, id) {
    await http.delete(`/api/admin/items/${type}/${id}`);
  }

  async function onApprove(type, id) {
    try {
      await setItemStatus(type, id, "approved");
      toast.success("Approved");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  async function onReject(type, id) {
    try {
      await setItemStatus(type, id, "rejected");
      toast.success("Rejected");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  async function onDelete(type, id) {
    try {
      await deleteItem(type, id);
      toast.success("Deleted");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed");
    }
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Admin Panel</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Manage users, moderate listings, approve/reject posts.
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-600 dark:text-slate-300">Users: {counts.users}</div>
            <div className="text-xs text-slate-600 dark:text-slate-300">Items: {counts.pending}</div>
            <Button variant="secondary" onClick={load}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      <Card className="rounded-2xl">
        <div className="grid gap-3 md:grid-cols-4">
          <Select label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>
          <div className="md:col-span-3 text-xs text-slate-600 dark:text-slate-300">
            Tip: only approved items show up publicly on Home/Browse.
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="glass h-72 rounded-2xl animate-pulse" />
      ) : (
        <div className="space-y-4">
          <Card className="rounded-2xl">
            <div className="text-sm font-semibold">Moderate Items</div>
            <div className="mt-3 space-y-3">
              {(items.lost || []).map((it) => (
                <ItemRow
                  key={it._id}
                  item={it}
                  type="lost"
                  onApprove={() => onApprove("lost", it._id)}
                  onReject={() => onReject("lost", it._id)}
                  onDelete={() => onDelete("lost", it._id)}
                />
              ))}
              {(items.found || []).map((it) => (
                <ItemRow
                  key={it._id}
                  item={it}
                  type="found"
                  onApprove={() => onApprove("found", it._id)}
                  onReject={() => onReject("found", it._id)}
                  onDelete={() => onDelete("found", it._id)}
                />
              ))}
              {!((items.lost || []).length + (items.found || []).length) ? (
                <div className="text-sm text-slate-600 dark:text-slate-300">No items found for this filter.</div>
              ) : null}
            </div>
          </Card>

          <Card className="rounded-2xl">
            <div className="text-sm font-semibold">Users</div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.slice(0, 100).map((u) => (
                    <tr key={u._id} className="border-t border-white/10">
                      <td className="py-2 pr-4">{u.name}</td>
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

