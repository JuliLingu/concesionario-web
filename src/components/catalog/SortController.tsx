"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Mounts on the client and wires the #sort-select dropdown
 * (rendered by the server) to router navigation.
 */
export const SortController = ({ currentSort }: { currentSort: string }) => {
  const router   = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const select = document.getElementById("sort-select") as HTMLSelectElement | null;
    if (!select) return;

    // Set current value from server
    select.value = currentSort;

    const handler = (e: Event) => {
      const value = (e.target as HTMLSelectElement).value;
      const params = new URLSearchParams(searchParams.toString());
      params.set("sort", value);
      params.delete("page"); // reset to page 1 on sort change
      router.push(`${pathname}?${params.toString()}`);
    };

    select.addEventListener("change", handler);
    return () => select.removeEventListener("change", handler);
  }, [currentSort, pathname, router, searchParams]);

  return null; // renders nothing — purely behavioral
};
