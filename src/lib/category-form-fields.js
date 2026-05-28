/**
 * Category-aware post-ad fields — only show relevant inputs per selection.
 */

const BASE_FIELDS = ["title", "description", "price", "condition", "city", "delivery", "contactPhone"];

const FIELD_DEFS = {
  brand: { key: "brand", label: "Brand", placeholder: "e.g. Samsung, Honda" },
  model: { key: "model", label: "Model", placeholder: "e.g. Galaxy S24, Civic Oriel" },
  year: { key: "year", label: "Year", placeholder: "e.g. 2022", type: "number" },
  ram: { key: "ram", label: "RAM", placeholder: "e.g. 8GB" },
  storage: { key: "storage", label: "Storage", placeholder: "e.g. 256GB" },
  color: { key: "color", label: "Color", placeholder: "e.g. Space Black" },
  warranty: { key: "warranty", label: "Warranty", placeholder: "e.g. 6 months remaining" },
  mileage: { key: "mileage", label: "Mileage (km)", placeholder: "e.g. 45000", type: "number" },
  engine: { key: "engine", label: "Engine", placeholder: "e.g. 1800cc Turbo" },
  transmission: { key: "transmission", label: "Transmission", placeholder: "Automatic / Manual" },
  area: { key: "area", label: "Area (sq ft / marla)", placeholder: "e.g. 5 Marla" },
  bedrooms: { key: "bedrooms", label: "Bedrooms", placeholder: "e.g. 3" },
  size: { key: "size", label: "Size", placeholder: "e.g. Large / EU 42" },
  material: { key: "material", label: "Material", placeholder: "e.g. Leather, Wood" },
  licenseType: { key: "licenseType", label: "License type", placeholder: "e.g. Windows, Office 365" },
  validity: { key: "validity", label: "Validity", placeholder: "e.g. Lifetime, 1 year" },
  platform: { key: "platform", label: "Platform", placeholder: "e.g. Steam, PlayStation" },
  deliveryMethod: {
    key: "deliveryMethod",
    label: "Delivery method",
    placeholder: "Courier / Digital key / Meet-up",
  },
};

/** categoryId -> subcategoryId -> leafId? -> field keys */
const MATRIX = {
  electronics: {
    mobile: ["brand", "model", "storage", "color", "warranty", "deliveryMethod"],
    laptops: ["brand", "model", "ram", "storage", "year", "warranty", "deliveryMethod"],
    "tv-audio": ["brand", "model", "warranty", "deliveryMethod"],
    software: ["licenseType", "validity", "platform", "deliveryMethod"],
    default: ["brand", "model", "deliveryMethod"],
  },
  vehicles: {
    cars: ["brand", "model", "year", "mileage", "engine", "transmission", "color", "deliveryMethod"],
    bikes: ["brand", "model", "year", "mileage", "deliveryMethod"],
    default: ["brand", "model", "year", "mileage"],
  },
  property: {
    sale: ["area", "bedrooms", "deliveryMethod"],
    rent: ["area", "bedrooms", "deliveryMethod"],
    default: ["area", "bedrooms"],
  },
  fashion: {
    mens: ["brand", "size", "color", "deliveryMethod"],
    womens: ["brand", "size", "color", "material", "deliveryMethod"],
    default: ["brand", "size", "color"],
  },
  "home-garden": {
    furniture: ["material", "color", "deliveryMethod"],
    appliances: ["brand", "model", "warranty", "deliveryMethod"],
    default: ["brand", "deliveryMethod"],
  },
  services: {
    freelance: ["deliveryMethod"],
    default: ["deliveryMethod"],
  },
};

export function getFieldsForCategory(categoryId, subcategoryId) {
  const cat = MATRIX[categoryId];
  if (!cat) return [];
  const keys = cat[subcategoryId] || cat.default || [];
  return keys.map((k) => FIELD_DEFS[k]).filter(Boolean);
}

export function getBaseFieldKeys() {
  return BASE_FIELDS;
}
