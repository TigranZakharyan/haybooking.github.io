import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "@/services/api";
import { useTranslation } from "react-i18next";

export type TNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  seen: boolean;
  seenAt?: string;
  createdAt: string;
  booking?: {
    _id: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: string;
    customerInfo: { firstName: string; lastName: string };
    branch: string;
  };
};

type TPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

const POLL_INTERVAL = 30_000;

export function useNotifications(open: boolean, branchId: string | null = null) {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.slice(0, 2) as "en" | "hy" | "ru") || "en";

  const [notifications, setNotifications] = useState<TNotification[]>([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [pagination, setPagination] = useState<TPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const branchIdRef = useRef(branchId);
  const langRef = useRef(lang);
  const openRef = useRef(open);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep refs in sync — runs before effects that depend on these values
  branchIdRef.current = branchId;
  langRef.current = lang;
  openRef.current = open;

  console.log("[useNotifications] render — open:", open, "branchId:", branchId);

  const fetchNotifications = useCallback(async (p = 1) => {
    const currentBranchId = branchIdRef.current;
    const currentLang = langRef.current;

    console.log("[useNotifications] fetchNotifications called — page:", p, "branchId:", currentBranchId, "lang:", currentLang);

    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page: p,
        limit: 20,
        lang: currentLang,
      };
      if (currentBranchId) {
        params.branchId = currentBranchId;
      }

      console.log("[useNotifications] API params:", params);

      const data = await notificationService.getNotifications(params);

      console.log("[useNotifications] API response:", data);

      setUnseenCount(data.unseenCount);
      setNotifications((prev) =>
        p === 1 ? data.notifications : [...prev, ...data.notifications]
      );
      setPagination(data.pagination);
      setPage(p);
    } catch (err) {
      console.error("[useNotifications] fetchNotifications error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCount = useCallback(async () => {
    const currentBranchId = branchIdRef.current;
    console.log("[useNotifications] refreshCount — branchId:", currentBranchId);
    try {
      const { unseenCount } = await notificationService.getUnseenCount(currentBranchId);
      setUnseenCount(unseenCount);
    } catch (err) {
      console.error("[useNotifications] refreshCount error:", err);
    }
  }, []);

  // Open → fetch
  useEffect(() => {
    console.log("[useNotifications] open effect fired — open:", open, "branchIdRef.current:", branchIdRef.current);
    if (open) {
      fetchNotifications(1);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // branchId changes while open → re-fetch
  useEffect(() => {
    console.log("[useNotifications] branchId effect fired — branchId:", branchId, "openRef.current:", openRef.current);
    if (openRef.current) {
      fetchNotifications(1);
    }
  }, [branchId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll
  useEffect(() => {
    refreshCount();
    pollRef.current = setInterval(refreshCount, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const markSeen = useCallback(async (id: string) => {
    try {
      await notificationService.markSeen(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, seen: true } : n))
      );
      setUnseenCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  }, []);

  const markAllSeen = useCallback(async () => {
    try {
      await notificationService.markAllSeen();
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      setUnseenCount(0);
    } catch {
      // silent
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.seen)
          setUnseenCount((c) => Math.max(0, c - 1));
        return prev.filter((n) => n._id !== id);
      });
    } catch {
      // silent
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination && page < pagination.pages) {
      fetchNotifications(page + 1);
    }
  }, [pagination, page, fetchNotifications]);

  return {
    notifications,
    unseenCount,
    pagination,
    loading,
    markSeen,
    markAllSeen,
    remove,
    loadMore,
  };
}