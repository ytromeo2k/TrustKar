"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CATEGORY_TREE, getCategoryPathLabels } from "@/lib/categories";
import { getFieldsForCategory } from "@/lib/category-form-fields";
import ImageUploader, { MIN_IMAGES } from "@/components/ImageUploader";
import { createAd } from "@/lib/firestore-helpers";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import { CONDITIONS, CITIES } from "@/lib/constants";
import RequireAuth from "@/components/RequireAuth";
import { Loader2, PlusCircle } from "lucide-react";

export default function PostAdPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [images, setImages] = useState([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    negotiable: false,
    condition: "Good",
    brand: "",
    model: "",
    year: "",
    ram: "",
    storage: "",
    color: "",
    warranty: "",
    city: "Karachi",
    delivery: "both",
    milestoneEnabled: false,
    upfrontPercent: 20,
    categoryId: "",
    subcategoryId: "",
    leafId: "",
    contactPhone: "",
  });
  const [extraAttrs, setExtraAttrs] = useState({});

  const dynamicFields = useMemo(
    () => getFieldsForCategory(form.categoryId, form.subcategoryId),
    [form.categoryId, form.subcategoryId]
  );

  const subcategories = useMemo(() => {
    const cat = CATEGORY_TREE.find((c) => c.id === form.categoryId);
    return cat?.subcategories || [];
  }, [form.categoryId]);

  const leafCategories = useMemo(() => {
    const sub = subcategories.find((s) => s.id === form.subcategoryId);
    return sub?.subcategories || [];
  }, [form.categoryId, form.subcategoryId, subcategories]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!user) {
      router.push("/auth/login?redirect=/post-ad");
      return;
    }
    if (images.length < MIN_IMAGES) {
      setError(`Please upload at least ${MIN_IMAGES} images.`);
      return;
    }
    if (!form.categoryId || !form.title || !form.price || !form.description) {
      setError("Fill all required fields including category and title.");
      return;
    }

    const pathLabels = getCategoryPathLabels(form.categoryId, form.subcategoryId, form.leafId);
    const categoryName = pathLabels.join(" › ") || "General";

    setSubmitting(true);
    try {
      const imageUrls = images.map((i) => i.url);
      const adId = await createAd(
        {
          title: form.title.trim(),
          description: form.description.trim(),
          price: Number(form.price),
          negotiable: form.negotiable,
          condition: form.condition,
          brand: (extraAttrs.brand || form.brand || "").trim(),
          model: (extraAttrs.model || form.model || "").trim(),
          year: (extraAttrs.year || form.year || "").trim(),
          attributes: Object.fromEntries(
            dynamicFields.map((f) => [f.key, String(extraAttrs[f.key] || "").trim()]).filter(([, v]) => v)
          ),
          city: form.city,
          location: form.city,
          delivery: form.delivery,
          categoryId: form.categoryId,
          subcategoryId: form.subcategoryId || null,
          leafId: form.leafId || null,
          categoryName,
          images: imageUrls,
          mainImage: images[mainIndex]?.url || imageUrls[0],
          contactPhone: form.contactPhone || profile?.phone || "",
          milestoneEnabled: form.milestoneEnabled,
          upfrontPercent: form.milestoneEnabled ? Number(form.upfrontPercent) : null,
          escrowVerified: false,
          sellerTrustRating: profile?.trustRating ?? 5,
          sellerName: profile?.displayName || user.displayName || "Seller",
        },
        user.uid
      );
      router.push(`/ad/${adId}?posted=1`);
    } catch (err) {
      setError(getAuthErrorMessage(err.code || err.message) || "Failed to post ad. Sign in + Firestore rules check karein.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <RequireAuth>
    <div className="tk-container max-w-3xl py-10">
      <div className="mb-8 flex items-center gap-3">
        <PlusCircle className="h-10 w-10 text-cyan-600" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Post a new ad</h1>
          <p className="text-sm text-slate-600">Escrow-ready · category-specific form · courier-friendly items</p>
        </div>
      </div>

      <p className="mb-4 text-sm text-sky-700">
        Signed in as <strong>{profile?.displayName || user?.email}</strong>
      </p>

      <form onSubmit={handleSubmit} className="tk-card space-y-8">
        {/* Category */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-900">Category *</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <select
              required
              value={form.categoryId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  categoryId: e.target.value,
                  subcategoryId: "",
                  leafId: "",
                }))
              }
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="">Main category</option>
              {CATEGORY_TREE.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={form.subcategoryId}
              onChange={(e) =>
                setForm((f) => ({ ...f, subcategoryId: e.target.value, leafId: "" }))
              }
              disabled={!form.categoryId}
              className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            >
              <option value="">Subcategory</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={form.leafId}
              onChange={(e) => update("leafId", e.target.value)}
              disabled={!leafCategories.length}
              className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            >
              <option value="">Type / Model line</option>
              {leafCategories.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Images */}
        <fieldset>
          <legend className="mb-4 text-lg font-semibold text-slate-900">Photos *</legend>
          <ImageUploader
            images={images}
            setImages={setImages}
            mainIndex={mainIndex}
            setMainIndex={setMainIndex}
          />
        </fieldset>

        {/* Basic info */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-900">Item details *</legend>
          <input
            required
            placeholder="Title (e.g. iPhone 14 Pro Max 256GB)"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <textarea
            required
            rows={5}
            placeholder="Full description — condition, accessories, reason for sale..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              type="number"
              min="1"
              placeholder="Price (PKR)"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              value={form.condition}
              onChange={(e) => update("condition", e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.negotiable}
              onChange={(e) => update("negotiable", e.target.checked)}
            />
            Price negotiable
          </label>
        </fieldset>

        {form.categoryId && form.subcategoryId && dynamicFields.length > 0 && (
          <fieldset className="space-y-4">
            <legend className="text-lg font-semibold text-slate-900">
              Details for this category
            </legend>
            <p className="text-xs text-slate-500">Only relevant fields for your selection — no random RAM/storage for wrong items.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {dynamicFields.map((f) => (
                <div key={f.key}>
                  <label className="mb-1 block text-xs font-bold text-slate-600">{f.label}</label>
                  <input
                    type={f.type === "number" ? "number" : "text"}
                    placeholder={f.placeholder}
                    value={extraAttrs[f.key] || ""}
                    onChange={(e) => setExtraAttrs((a) => ({ ...a, [f.key]: e.target.value }))}
                    className="tk-input"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        )}

        {/* Location & delivery */}
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-slate-900">Location & delivery</legend>
          <select value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={form.delivery} onChange={(e) => update("delivery", e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="pickup">Pickup only</option>
            <option value="shipping">Shipping only</option>
            <option value="both">Pickup or shipping</option>
          </select>
          <input
            placeholder="Contact phone"
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </fieldset>

        {/* Milestone */}
        <fieldset className="space-y-3 rounded-lg border border-teal-100 bg-teal-50 p-4">
          <legend className="font-semibold text-teal-900">Milestone payments (high-value items)</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.milestoneEnabled}
              onChange={(e) => update("milestoneEnabled", e.target.checked)}
            />
            Enable partial escrow (e.g. 20% upfront, rest on delivery)
          </label>
          {form.milestoneEnabled && (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="50"
                value={form.upfrontPercent}
                onChange={(e) => update("upfrontPercent", e.target.value)}
                className="w-20 rounded border px-2 py-1"
              />
              <span className="text-sm">% upfront via TRUSTKAR escrow</span>
            </div>
          )}
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 py-3 font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          Publish on TRUSTKAR
        </button>
      </form>
    </div>
    </RequireAuth>
  );
}
