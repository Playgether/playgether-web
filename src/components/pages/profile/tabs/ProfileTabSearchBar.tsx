"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 400;

interface ProfileTabSearchBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateRangeChange: (from: string, to: string) => void;
  onSearchSubmit: (filters: {
    search: string;
    timestampStart: string | null;
    timestampEnd: string | null;
  }) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
  placeholder?: string;
  className?: string;
}

export function ProfileTabSearchBar({
  search,
  onSearchChange,
  dateFrom,
  dateTo,
  onDateRangeChange,
  onSearchSubmit,
  onClear,
  hasActiveFilters,
  placeholder = "Buscar por palavra no texto...",
  className,
}: ProfileTabSearchBarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHadFiltersRef = useRef(false);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const buildFilters = useCallback(() => {
    const timestampStart = dateFrom
      ? `${dateFrom}T00:00:00`
      : null;
    const timestampEnd = dateTo
      ? `${dateTo}T23:59:59.999999`
      : null;
    return {
      search: localSearch.trim() || "",
      timestampStart,
      timestampEnd,
    };
  }, [localSearch, dateFrom, dateTo]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const f = buildFilters();
      const hasAny = !!(f.search || f.timestampStart || f.timestampEnd);
      if (hasAny) {
        lastHadFiltersRef.current = true;
        onSearchSubmit({
          search: f.search || null,
          timestampStart: f.timestampStart,
          timestampEnd: f.timestampEnd,
        });
      } else {
        if (lastHadFiltersRef.current) {
          lastHadFiltersRef.current = false;
          onClear();
        }
      }
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [localSearch, dateFrom, dateTo, onSearchSubmit, onClear, buildFilters]);

  const handleClear = () => {
    setLocalSearch("");
    onSearchChange("");
    onDateRangeChange("", "");
    onClear();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const f = buildFilters();
      const hasAny = !!(f.search || f.timestampStart || f.timestampEnd);
      if (hasAny) {
        lastHadFiltersRef.current = true;
        onSearchSubmit({
          search: f.search || null,
          timestampStart: f.timestampStart,
          timestampEnd: f.timestampEnd,
        });
      } else if (lastHadFiltersRef.current) {
        lastHadFiltersRef.current = false;
        onClear();
      }
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              onSearchChange(e.target.value);
            }}
            onKeyDown={handleSearchKeyDown}
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateRangeChange(e.target.value, dateTo)}
            className="w-[140px]"
            title="Data inicial"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateRangeChange(dateFrom, e.target.value)}
            className="w-[140px]"
            title="Data final"
          />
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClear}
              className="shrink-0"
              title="Limpar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
