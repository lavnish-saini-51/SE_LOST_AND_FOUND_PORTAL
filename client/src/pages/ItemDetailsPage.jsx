import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { MapPin, Tag } from "lucide-react";
import { http } from "../api/http";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Modal from "../components/ui/Modal.jsx";
import Input from "../components/ui/Input.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import ItemCard from "../components/ItemCard.jsx";
import { useAuth } from "../state/AuthContext.jsx";
import { resolveImageUrl } from "../lib/image";
import { emitLostResolved } from "../lib/events";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, isAuthed } = useAuth();
  const [sp] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [contact, setContact] = useState(null);
  const [matches, setMatches] = useState([]);

  const [claimOpen, setClaimOpen] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claim, setClaim] = useState({ message: "", contactName: "", contactEmail: "", contactPhone: "" });

  const isLost = item?.type === "lost";
  const img = resolveImageUrl(item?.image?.url);

  const canClaim = useMemo(() => {
    if (!isLost) return false;
    if (item?.resolved) return false;
    if (!isAuthed) return true;
    return String(user?.id) !== String(item?.owner?._id);
  }, [isLost, item, isAuthed, user]);

  async function load() {
    try {
      setLoading(true);
      const { data } = await http.get(`/api/items/${id}`, { params: { matches: "1" } });
      setItem(data.item);
      setContact(data.contact || null);
      setMatches(data.matches || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load item");
      nav("/404", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const wantsClaim = sp.get("claim") === "1";
    if (!wantsClaim) return;
    if (!item || item.type !== "lost") return;
    if (item.resolved) return;
    if (!isAuthed) return;
    if (String(user?.id) === String(item?.owner?._id)) return;
    setClaimOpen(true);
  }, [sp, item, isAuthed, user]);

  async function markFound() {
    try {
      await http.post(`/api/lost/${id}/mark-found`);
      toast.success("Item marked as found.");
      emitLostResolved();
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Action failed");
    }
  }

  async function submitClaim(e) {
    e.preventDefault();
    if (!isAuthed) return nav("/login", { state: { from: `/items/${id}` } });
    try {
      setClaimLoading(true);
      await http.post(`/api/lost/${id}/claim`, claim);
      toast.success("Claim sent to owner");
      setClaimOpen(false);
      setClaim({ message: "", contactName: "", contactEmail: "", contactPhone: "" });
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Claim failed");
    } finally {
      setClaimLoading(false);
    }
  }

  if (loading) return <div className="glass h-80 rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-xl border border-white/20 bg-white/20 dark:border-white/10 dark:bg-white/5">
              <div className="h-60 bg-slate-200/40 dark:bg-white/5">
                {img ? (
                  <img src={img} alt={item.itemName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                    No image
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="md:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {item.type === "lost" ? "Lost item" : "Found item"}
                </div>
                <div className="mt-1 text-2xl font-semibold tracking-tight">{item.itemName}</div>
              </div>
              <div className="flex gap-2">
                <Link to="/search">
                  <Button variant="secondary">Back to browse</Button>
                </Link>
                {isLost && String(user?.id) === String(item?.owner?._id) ? (
                  <Button variant="secondary" onClick={markFound} disabled={item.resolved}>
                    Mark found
                  </Button>
                ) : null}
                {canClaim ? (
                  <Button
                    onClick={() =>
                      isAuthed ? setClaimOpen(true) : nav("/login", { state: { from: `/items/${id}` } })
                    }
                  >
                    I Found This
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2 py-1 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <Tag className="h-3.5 w-3.5" />
                {item.category}
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/20 px-2 py-1 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                <MapPin className="h-3.5 w-3.5" />
                {item.location}
              </div>
              {isLost && item.reward ? (
                <div className="inline-flex items-center rounded-full border border-white/20 bg-white/20 px-2 py-1 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                  Reward: {item.reward}
                </div>
              ) : null}
              {isLost && item.resolved ? (
                <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-emerald-700 dark:text-emerald-200">
                  Resolved
                </div>
              ) : null}
            </div>

            <div className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">{item.description}</div>

            <div className="mt-5 rounded-xl border border-white/20 bg-white/20 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="text-sm font-semibold">Contact</div>
              {!isAuthed ? (
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Login to view contact details and connect safely.
                </div>
              ) : (
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="text-slate-700 dark:text-slate-200">
                    Name: <span className="font-semibold">{contact?.name || "—"}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200">
                    Email: <span className="font-semibold">{contact?.email || "—"}</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200">
                    Phone: <span className="font-semibold">{contact?.phone || "—"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {isLost ? (
        <Card className="rounded-2xl">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Possible matches</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Based on category, name and location overlap.
              </div>
            </div>
            <Link to={`/search?type=found&category=${encodeURIComponent(item.category)}`}>
              <Button variant="secondary">Browse found</Button>
            </Link>
          </div>
          <div className="mt-4">
            {matches.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                  <div key={m.id} className="space-y-2">
                    <ItemCard item={m} />
                    <div className="text-xs text-slate-600 dark:text-slate-300">Match score: {m.score}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-600 dark:text-slate-300">No strong matches yet.</div>
            )}
          </div>
        </Card>
      ) : null}

      <Modal open={claimOpen} title={`Claim: ${item?.itemName || ""}`} onClose={() => setClaimOpen(false)}>
        <form onSubmit={submitClaim} className="space-y-3">
          <Textarea
            label="Message"
            rows={4}
            value={claim.message}
            onChange={(e) => setClaim((c) => ({ ...c, message: e.target.value }))}
            placeholder="Where you found it, identifying details, best way to reach you…"
            required
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Your name"
              value={claim.contactName}
              onChange={(e) => setClaim((c) => ({ ...c, contactName: e.target.value }))}
            />
            <Input
              label="Your email"
              type="email"
              value={claim.contactEmail}
              onChange={(e) => setClaim((c) => ({ ...c, contactEmail: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Input
                label="Your phone"
                value={claim.contactPhone}
                onChange={(e) => setClaim((c) => ({ ...c, contactPhone: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setClaimOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={claimLoading}>
              {claimLoading ? "Sending…" : "Send claim"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
