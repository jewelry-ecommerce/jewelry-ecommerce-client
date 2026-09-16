"use client";

import { useProductWishlist } from "@/hooks";
import { useAppSelector } from "@/redux/hooks";
import { selectIsLogin } from "@/redux/slices/auth.slice";
import {
  deleteSearchHistory,
  getSearchHistory,
  getSearchLanding,
  getSearchSuggestions,
  getSearchTrending,
} from "@/utils/api/product/product.api";
import { normalizeCatalogSearchQuery } from "@/utils/search/catalog-search-query.util";
import { getErrorMessage } from "@/utils/helpers/axios";
import type { ISearchHistoryItem, ISearchSuggestionsResponse } from "@/utils/api/product/product.interface";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

const SEARCH_HISTORY_STORAGE_KEY = "search_history_keywords";
const SEARCH_HISTORY_KEYWORD_LIMIT = 5;
const SEARCH_LIMIT = 10;
const SEARCH_SUGGESTION_MIN_LENGTH = 3;
const SEARCH_LANDING_LIMIT = 4;

const normalizeKeyword = (keyword: string) => normalizeCatalogSearchQuery(keyword.trim());

const parseGuestSearchHistory = (): string[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(SEARCH_HISTORY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map(normalizeKeyword)
      .filter(Boolean);
  } catch {
    return [];
  }
};

const buildSearchHistory = (keywords: string[]) => {
  const seen = new Set<string>();

  return keywords
    .map(normalizeKeyword)
    .filter((keyword) => {
      if (!keyword) {
        return false;
      }

      const normalizedKey = keyword.toLowerCase();
      if (seen.has(normalizedKey)) {
        return false;
      }

      seen.add(normalizedKey);
      return true;
    })
    .slice(0, SEARCH_HISTORY_KEYWORD_LIMIT);
};

const persistGuestSearchHistory = (keywords: string[]) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SEARCH_HISTORY_STORAGE_KEY, JSON.stringify(keywords));
};

const extractHistoryKeyword = (item: string | ISearchHistoryItem) => {
  if (typeof item === "string") {
    return item;
  }

  return item?.keyword || "";
};

type UseHeaderMegaSearchParams = {
  open: boolean;
  onClose: () => void;
};

export const useHeaderMegaSearch = ({ open, onClose }: UseHeaderMegaSearchParams) => {
  const router = useRouter();
  const isLogin = useAppSelector(selectIsLogin);

  // State
  const [searchValue, setSearchValue] = useState("");
  const [guestHistoryKeywords, setGuestHistoryKeywords] = useState<string[]>([]);
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // Data
  const { data: landingProducts = [] } = useSWR(open ? "search-landing" : null, () => getSearchLanding());
  const { data: trendingKeywords = [] } = useSWR(open ? ["search-trending", SEARCH_LIMIT] : null, ([, limit]) => getSearchTrending(limit));
  const { data: accountHistoryKeywords = [], mutate: mutateAccountHistoryKeywords } = useSWR(
    open && isLogin ? ["search-history", SEARCH_HISTORY_KEYWORD_LIMIT] : null,
    ([, limit]) => getSearchHistory(limit),
  );
  const { data: suggestionItems = [] } = useSWR(
    open && debouncedSearchValue.length >= SEARCH_SUGGESTION_MIN_LENGTH ? ["search-suggestions", debouncedSearchValue] : null,
    ([, query]) => getSearchSuggestions(query),
  );
  const { mapWishlistProducts } = useProductWishlist();

  // Effect
  useEffect(() => {
    if (!open) {
      setSearchValue("");
      setDebouncedSearchValue("");
      return;
    }

    if (!isLogin) {
      const normalized = buildSearchHistory(parseGuestSearchHistory());
      setGuestHistoryKeywords(normalized);
      persistGuestSearchHistory(normalized);
    }
  }, [isLogin, open]);

  useEffect(() => {
    const trimmedValue = searchValue.trim();
    const timer = window.setTimeout(() => {
      setDebouncedSearchValue(trimmedValue);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchValue]);

  // Computed
  const historyKeywords = useMemo(
    () =>
      buildSearchHistory(
        (isLogin ? accountHistoryKeywords : guestHistoryKeywords).map((item) => normalizeKeyword(extractHistoryKeyword(item))),
      ),
    [accountHistoryKeywords, guestHistoryKeywords, isLogin],
  );

  const featuredProducts = useMemo(
    () => mapWishlistProducts(landingProducts.slice(0, SEARCH_LANDING_LIMIT)),
    [landingProducts, mapWishlistProducts],
  );

  const shouldShowSuggestions = debouncedSearchValue.length >= SEARCH_SUGGESTION_MIN_LENGTH;
  const showHistoryColumn = historyKeywords.length > 0;

  // Function
  const saveGuestKeyword = useCallback((keyword: string) => {
    setGuestHistoryKeywords((prev) => {
      const nextKeywords = buildSearchHistory([keyword, ...prev]);
      persistGuestSearchHistory(nextKeywords);
      return nextKeywords;
    });
  }, []);

  const navigateToSearchResults = useCallback(
    (keyword: string) => {
      const nextKeyword = normalizeKeyword(keyword);
      if (!nextKeyword) {
        return;
      }

      if (!isLogin) {
        saveGuestKeyword(nextKeyword);
      }

      onClose();
      router.push(`/tim-kiem?query=${encodeURIComponent(nextKeyword)}`);
    },
    [isLogin, onClose, router, saveGuestKeyword],
  );

  const navigateToCategory = useCallback(
    (suggestion: ISearchSuggestionsResponse) => {
      const targetSlug = suggestion.slug;
      if (!targetSlug) {
        return;
      }

      onClose();
      const segments = targetSlug
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment));
      router.push(`/san-pham/${segments.join("/")}`);
    },
    [onClose, router],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: ISearchSuggestionsResponse) => {
      if (suggestion.type === "category") {
        navigateToCategory(suggestion);
        return;
      }

      navigateToSearchResults(suggestion.text);
    },
    [navigateToCategory, navigateToSearchResults],
  );

  const handleClearHistory = useCallback(async () => {
    if (isLogin) {
      try {
        await deleteSearchHistory();
        await mutateAccountHistoryKeywords([], false);
      } catch (error) {
        // toast.error(getErrorMessage(error) || "Không thể xoá lịch sử tìm kiếm. Vui lòng thử lại.");
      }
      return;
    }

    persistGuestSearchHistory([]);
    setGuestHistoryKeywords([]);
  }, [isLogin, mutateAccountHistoryKeywords]);

  const handleSearchSubmit = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      navigateToSearchResults(searchValue);
    },
    [navigateToSearchResults, searchValue],
  );

  return {
    // State
    searchValue,
    setSearchValue,

    // Data
    trendingKeywords,
    suggestionItems,
    featuredProducts,
    historyKeywords,

    // Computed
    shouldShowSuggestions,
    showHistoryColumn,

    // Function
    handleSuggestionClick,
    handleClearHistory,
    handleSearchSubmit,
    navigateToSearchResults,
  };
};
