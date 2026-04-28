import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { http } from "../api/http";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import LostItemCard from "../components/LostItemCard.jsx";
import { CATEGORIES } from "../lib/categories";
import { onLostResolved } from "../lib/events";

export default function LostItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    q: "",
    category: "",
    location: ""
  });

  const params = useMemo(
    () => ({
      page,
      limit: 12
    }),
    [page]
  );

  async function load() {
    try {
      setLoading(true);
      const { data } = await http.get("/api/lost/all", { params });
      let list = data.items || [];
      if (filters.q) {
        const rx = new RegExp(filters.q.trim(), "i");
        list = list.filter((x) => rx.test(x.itemName) || rx.test(x.description));
      }
      if (filters.category) list = list.filter((x) => x.category === filters.category);
      if (filters.location) {
        const rx = new RegExp(filters.location.trim(), "i");
        list = list.filter((x) => rx.test(x.location));
      }
      setItems(list);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load lost items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    const off = onLostResolved(() => load());
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPage(1);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category, filters.location]);

  function set(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xl font-semibold tracking-tight">Lost Items</div>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Browse public lost listings and connect via secure claims.
          </div>
        </div>
        <Button variant="secondary" onClick={load}>
          Refresh
        </Button>
      </div>

      <Card className="rounded-2xl">
        <div className="grid gap-3 md:grid-cols-4">
          <Input label="Search" value={filters.q} onChange={(e) => set("q", e.target.value)} placeholder="Wallet…" />
          <Select label="Category" value={filters.category} onChange={(e) => set("category", e.target.value)}>
            <option value="">Any</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Location"
            value={filters.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Station, campus…"
          />
          <div className="flex items-end justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setFilters({ q: "", category: "", location: "" })}
              disabled={!filters.q && !filters.category && !filters.location}
            >
              Clear
            </Button>
            <Button onClick={() => (setPage(1), load())}>Apply</Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass h-[360px] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : items.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <LostItemCard key={it.id} item={it} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card className="rounded-2xl">
          <div className="text-sm font-semibold">No lost items found</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Try adjusting search, category, or location filters.
          </div>
        </Card>
      )}
    </div>
  );
}
