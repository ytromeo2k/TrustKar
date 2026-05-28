/**
 * TRUSTKAR marketplace category tree (Pakistan-focused).
 * Used for navbar, post-ad cascading dropdowns, and Firestore filtering.
 */

export const CATEGORY_TREE = [
  {
    id: "electronics",
    name: "Electronics",
    subcategories: [
      {
        id: "mobile",
        name: "Mobile Phones",
        subcategories: [
          { id: "iphone", name: "iPhone" },
          { id: "samsung", name: "Samsung" },
          { id: "xiaomi", name: "Xiaomi / Redmi" },
          { id: "other-mobile", name: "Other Brands" },
        ],
      },
      {
        id: "laptops",
        name: "Laptops & Computers",
        subcategories: [
          { id: "macbook", name: "MacBook" },
          { id: "gaming-laptop", name: "Gaming Laptops" },
          { id: "office-laptop", name: "Office / Business" },
        ],
      },
      {
        id: "tv-audio",
        name: "TV & Audio",
        subcategories: [
          { id: "led-tv", name: "LED / Smart TV" },
          { id: "speakers", name: "Speakers & Headphones" },
        ],
      },
      {
        id: "software",
        name: "Software & Digital",
        subcategories: [
          { id: "licenses", name: "Licenses & Keys" },
          { id: "subscriptions", name: "Subscriptions" },
          { id: "games-digital", name: "Digital Games" },
        ],
      },
    ],
  },
  {
    id: "vehicles",
    name: "Vehicles",
    subcategories: [
      {
        id: "cars",
        name: "Cars",
        subcategories: [
          { id: "sedan", name: "Sedan" },
          { id: "suv", name: "SUV / Crossover" },
          { id: "hatchback", name: "Hatchback" },
        ],
      },
      {
        id: "bikes",
        name: "Motorcycles",
        subcategories: [
          { id: "sport-bike", name: "Sport" },
          { id: "commuter-bike", name: "Commuter" },
        ],
      },
    ],
  },
  {
    id: "property",
    name: "Property",
    subcategories: [
      {
        id: "sale",
        name: "For Sale",
        subcategories: [
          { id: "house", name: "House" },
          { id: "apartment", name: "Apartment" },
          { id: "plot", name: "Plot / Land" },
        ],
      },
      {
        id: "rent",
        name: "For Rent",
        subcategories: [
          { id: "rent-house", name: "House" },
          { id: "rent-apartment", name: "Apartment" },
        ],
      },
    ],
  },
  {
    id: "fashion",
    name: "Fashion & Beauty",
    subcategories: [
      {
        id: "mens",
        name: "Men's Wear",
        subcategories: [
          { id: "mens-shoes", name: "Shoes" },
          { id: "mens-watches", name: "Watches" },
        ],
      },
      {
        id: "womens",
        name: "Women's Wear",
        subcategories: [
          { id: "womens-bags", name: "Bags" },
          { id: "jewelry", name: "Jewelry" },
        ],
      },
    ],
  },
  {
    id: "home-garden",
    name: "Home & Garden",
    subcategories: [
      {
        id: "furniture",
        name: "Furniture",
        subcategories: [
          { id: "sofa", name: "Sofa & Seating" },
          { id: "bedroom", name: "Bedroom" },
        ],
      },
      {
        id: "appliances",
        name: "Home Appliances",
        subcategories: [
          { id: "ac", name: "AC & Coolers" },
          { id: "kitchen", name: "Kitchen Appliances" },
        ],
      },
    ],
  },
  {
    id: "services",
    name: "Services & Bespoke",
    subcategories: [
      {
        id: "freelance",
        name: "Freelance / Custom Work",
        subcategories: [
          { id: "design", name: "Design & Creative" },
          { id: "development", name: "Development" },
        ],
      },
    ],
  },
];

/** Flatten path labels for display, e.g. "Electronics > Mobile > iPhone" */
export function getCategoryPathLabels(categoryId, subcategoryId, leafId) {
  for (const cat of CATEGORY_TREE) {
    if (cat.id !== categoryId) continue;
    for (const sub of cat.subcategories || []) {
      if (sub.id !== subcategoryId) continue;
      for (const leaf of sub.subcategories || []) {
        if (leaf.id === leafId) {
          return [cat.name, sub.name, leaf.name];
        }
      }
      return [cat.name, sub.name];
    }
    return [cat.name];
  }
  return [];
}

export function findCategoryById(categoryId) {
  return CATEGORY_TREE.find((c) => c.id === categoryId) ?? null;
}

export function findSubcategory(categoryId, subcategoryId) {
  const cat = findCategoryById(categoryId);
  return cat?.subcategories?.find((s) => s.id === subcategoryId) ?? null;
}

/** Lucide icon names for category cards */
export const CATEGORY_ICONS = {
  electronics: "smartphone",
  vehicles: "car",
  property: "home",
  fashion: "shirt",
  "home-garden": "sofa",
  services: "briefcase",
};

/** Footer / nav links — only from CATEGORY_TREE */
export function getCategoryNavLinks() {
  return CATEGORY_TREE.map((c) => ({
    label: c.name,
    href: `/category/${c.id}`,
  }));
}

export function getFooterSubLinks() {
  const links = [];
  for (const cat of CATEGORY_TREE) {
    links.push({ label: cat.name, href: `/category/${cat.id}` });
    const firstSub = cat.subcategories?.[0];
    if (firstSub) {
      links.push({
        label: `${cat.name} › ${firstSub.name}`,
        href: `/category/${cat.id}?sub=${firstSub.id}`,
      });
    }
  }
  return links;
}
