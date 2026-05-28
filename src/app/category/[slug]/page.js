"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { findCategoryById } from "@/lib/categories";
import AdGallery from "@/components/AdGallery";
import { ChevronRight } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const sub = searchParams.get("sub") || "";
  const leaf = searchParams.get("leaf") || "";

  const category = findCategoryById(slug);

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Category not found</h1>
        <Link href="/" className="mt-4 inline-block text-teal-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-1 text-sm text-slate-500">
            <Link href="/" className="hover:text-teal-600">
              TRUSTKAR
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-slate-900">{category.name}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-bold text-[#002f34]">{category.name}</h1>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/category/${slug}`}
              className={`rounded-full px-3 py-1.5 text-sm ${
                !sub ? "bg-[#002f34] text-white" : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              All {category.name}
            </Link>
            {category.subcategories?.map((subCat) => (
              <div key={subCat.id} className="flex flex-wrap gap-1">
                <Link
                  href={`/category/${slug}?sub=${subCat.id}`}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    sub === subCat.id && !leaf
                      ? "bg-[#002f34] text-white"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {subCat.name}
                </Link>
                {sub === subCat.id &&
                  subCat.subcategories?.map((leafCat) => (
                    <Link
                      key={leafCat.id}
                      href={`/category/${slug}?sub=${subCat.id}&leaf=${leafCat.id}`}
                      className={`rounded-full px-3 py-1.5 text-sm ${
                        leaf === leafCat.id
                          ? "bg-amber-500 text-white"
                          : "bg-slate-50 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {leafCat.name}
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <AdGallery categoryId={slug} subcategoryId={sub || undefined} leafId={leaf || undefined} />
      </section>
    </div>
  );
}
