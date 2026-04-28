import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import Button from "../components/ui/Button.jsx";
import { CATEGORIES } from "../lib/categories";
import { http } from "../api/http";

export default function FoundFormPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const [form, setForm] = useState({
    itemName: "",
    category: "Electronics",
    description: "",
    foundLocation: "",
    dateFound: "",
    finderContactName: "",
    finderContactEmail: "",
    finderContactPhone: ""
  });

  const canSubmit = useMemo(() => {
    return (
      form.itemName &&
      form.category &&
      form.description &&
      form.foundLocation &&
      form.dateFound &&
      (form.finderContactEmail || form.finderContactPhone)
    );
  }, [form]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      const { data } = await http.post("/api/found/create", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Found item posted. Notified ${data.matchesNotified || 0} match(es).`);
      nav("/search?type=found");
    } catch (e2) {
      toast.error(e2?.response?.data?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Card className="rounded-2xl">
        <div className="text-lg font-semibold">Report Found Item</div>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Your post triggers matching and notifications.
        </div>
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
          <Input label="Item name" value={form.itemName} onChange={(e) => set("itemName", e.target.value)} required />
          <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <div className="md:col-span-2">
            <Textarea
              label="Description"
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>
          <Input
            label="Found location"
            value={form.foundLocation}
            onChange={(e) => set("foundLocation", e.target.value)}
            required
          />
          <Input
            label="Date found"
            type="date"
            value={form.dateFound}
            onChange={(e) => set("dateFound", e.target.value)}
            required
          />
          <Input
            label="Your name"
            value={form.finderContactName}
            onChange={(e) => set("finderContactName", e.target.value)}
            placeholder="Optional"
          />
          <Input
            label="Your email"
            type="email"
            value={form.finderContactEmail}
            onChange={(e) => set("finderContactEmail", e.target.value)}
            placeholder="Email or phone required"
          />
          <Input
            label="Your phone"
            value={form.finderContactPhone}
            onChange={(e) => set("finderContactPhone", e.target.value)}
            placeholder="Email or phone required"
          />
          <label className="md:col-span-2 block">
            <div className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">Upload image</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800 dark:text-slate-200 dark:file:bg-white dark:file:text-slate-900 dark:hover:file:bg-slate-100"
            />
          </label>
          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => nav(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || loading}>
              {loading ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
