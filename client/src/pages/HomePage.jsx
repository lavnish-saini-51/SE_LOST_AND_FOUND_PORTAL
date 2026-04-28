import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { http } from "../api/http";
import ItemCard from "../components/ItemCard.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import { CATEGORIES } from "../lib/categories";
import { onLostResolved } from "../lib/events";

export default function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [lost, found] = await Promise.all([
          http.get("/api/lost/all", { params: { limit: 8, page: 1 } }),
          http.get("/api/items/all", { params: { type: "found", limit: 8, sort: "newest", page: 1 } })
        ]);
        setLostItems(lost.data.items || []);
        setFoundItems(found.data.items || []);
      } catch {
        toast.error("Failed to load listings");
      } finally {
        setLoading(false);
      }
    };
    load();
    const off = onLostResolved(() => load());
    return off;
  }, []);

  function onSearch(e) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    if (type) sp.set("type", type);
    navigate(`/search?${sp.toString()}`);
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Find what you lost. Return what you found.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              Report lost items, post found items, browse listings, and contact people securely with claims and notifications.
            </p>

            <form onSubmit={onSearch} className="glass grid gap-3 rounded-2xl p-4 sm:grid-cols-2">
              <Input
                label="Search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Wallet, iPhone, keys…"
              />
              <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">All</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </Select>
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Any</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <span className="inline-flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                  </span>
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/report/lost")}>Report lost</Button>
              <Button variant="secondary" onClick={() => navigate("/report/found")}>
                Report found
              </Button>
              <Button variant="secondary" onClick={() => navigate("/lost")}>
                Browse lost
              </Button>
              <Button variant="secondary" onClick={() => navigate("/search?type=found")}>
                Browse found
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Latest lost items</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Browse and submit a claim if you found it.</div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/lost")}>
            View all lost
          </Button>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass h-[260px] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : lostItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lostItems.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-sm font-semibold">No lost items yet</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Post one to get started.</div>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Latest found items</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Help others recover their belongings.</div>
          </div>
          <Button variant="secondary" onClick={() => navigate("/search?type=found")}>
            View all found
          </Button>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass h-[260px] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : foundItems.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {foundItems.map((it) => (
              <ItemCard key={it.id} item={it} />
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-sm font-semibold">No found items yet</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">Post a found item to notify owners.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
