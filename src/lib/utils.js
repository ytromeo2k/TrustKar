export function formatPrice(amount, currency = "PKR") {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function groupAdsByCategory(ads) {
  const groups = {};
  for (const ad of ads) {
    const key = ad.categoryId || "other";
    if (!groups[key]) {
      groups[key] = {
        id: key,
        title: ad.categoryName?.split(" › ")[0] || key,
        ads: [],
      };
    }
    groups[key].ads.push(ad);
  }
  return Object.values(groups);
}
