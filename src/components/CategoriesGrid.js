"use client";

import Link from "next/link";
import {
  Smartphone,
  Car,
  Home,
  Shirt,
  Sofa,
  Briefcase,
  LayoutGrid,
} from "lucide-react";
import { CATEGORY_TREE, CATEGORY_ICONS } from "@/lib/categories";

const ICON_MAP = {
  smartphone: Smartphone,
  car: Car,
  home: Home,
  shirt: Shirt,
  sofa: Sofa,
  briefcase: Briefcase,
};

export default function CategoriesGrid() {
  return (
    <section>
      <h2 className="tk-section-title mb-4">Explore Categories</h2>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:gap-3">
        {CATEGORY_TREE.map((cat) => {
          const iconKey = CATEGORY_ICONS[cat.id] || "layout-grid";
          const Icon = ICON_MAP[iconKey] || LayoutGrid;
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
            >
              <Icon className="h-7 w-7 text-slate-500 transition group-hover:text-cyan-600" />
              <span className="text-center text-xs font-bold text-slate-700">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
