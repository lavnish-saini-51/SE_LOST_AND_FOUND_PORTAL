import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../api/http";
import ItemCard from "../components/ItemCard.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Button from "../components/ui/Button.jsx";
import { CATEGORIES } from "../lib/categories";
import { getParam, setParams } from "../lib/query";
import { onLostResolved } from "../lib/events";

export default function SearchResultsPage() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const q = getParam(sp, "q", "");
  const type = getParam(sp, "type", "");
  const category = getParam(sp, "category", "");
  const location = getParam(sp, "location", "");
  const sort = getParam(sp, "sort", "newest");

  const params = useMemo(
    () => ({
      q,
      type,
      category,
      location,
      sort,
      page
    }),
    [q, type, category, location, sort, page]
  );

  async function load() {
    try {
      setLoading(true);
      const { data } = await http.get("/api/items/all", { params });
      setItems(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    const off = onLostResolved(() => load());
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setFilter(next) {
    setPage(1);
    setSp(setParams(sp, next));
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <div className="grid gap-3 md:grid-cols-5">
          <Input label="Search" value={q} onChange={(e) => setFilter({ q: e.target.value })} placeholder="iPhone…" />
          <Select label="Type" value={type} onChange={(e) => setFilter({ type: e.target.value })}>
            <option value="">All</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </Select>
          <Select label="Category" value={category} onChange={(e) => setFilter({ category: e.target.value })}>
            <option value="">Any</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            label="Location"
            value={location}
            onChange={(e) => setFilter({ location: e.target.value })}
            placeholder="Metro station…"
          />
          <Select label="Sort" value={sort} onChange={(e) => setFilter({ sort: e.target.value })}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="glass h-[260px] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <ItemCard key={it.id} item={it} />
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
          <div className="text-sm font-semibold">No results</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Try different keywords or filters.</div>
        </Card>
      )}
    </div>
  );
}
