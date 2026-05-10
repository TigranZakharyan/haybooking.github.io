import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  Trash2,
  CheckCheck,
  BellOff,
  Loader2,
  CalendarCheck2,
  CalendarX2,
  CalendarCheck,
  UserX,
  CalendarPlus,
} from "lucide-react";
import type { TNotification } from "@/context/NoticationContext";

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string, lang: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (mins < 1) return rtf.format(0, "minute");
  if (mins < 60) return rtf.format(-mins, "minute");
  if (hrs < 24) return rtf.format(-hrs, "hour");
  return rtf.format(-days, "day");
}

// ── Notification Item ──────────────────────────────────────────────────────

function NotificationItem({
  n,
  lang,
  onMarkSeen,
  onDelete,
  t,
}: {
  n: TNotification;
  lang: string;
  onMarkSeen: (id: string) => void;
  onDelete: (id: string) => void;
  t: (key: string, fallback?: string) => string;
}) {
  const TYPE_CONFIG: Record<
    string,
    { Icon: React.ElementType; bg: string; icon: string; border: string; label: string }
  > = {
    new_booking: {
      Icon: CalendarPlus,
      bg: "bg-blue-50",
      icon: "text-blue-500",
      border: "border-blue-200",
      label: t("notifications.types.new_booking", "New"),
    },
    booking_confirmed: {
      Icon: CalendarCheck2,
      bg: "bg-emerald-50",
      icon: "text-emerald-500",
      border: "border-emerald-200",
      label: t("notifications.types.booking_confirmed", "Confirmed"),
    },
    booking_cancelled: {
      Icon: CalendarX2,
      bg: "bg-red-50",
      icon: "text-red-500",
      border: "border-red-200",
      label: t("notifications.types.booking_cancelled", "Cancelled"),
    },
    booking_completed: {
      Icon: CalendarCheck,
      bg: "bg-violet-50",
      icon: "text-violet-500",
      border: "border-violet-200",
      label: t("notifications.types.booking_completed", "Completed"),
    },
    no_show: {
      Icon: UserX,
      bg: "bg-amber-50",
      icon: "text-amber-500",
      border: "border-amber-200",
      label: t("notifications.types.no_show", "No-show"),
    },
  };

  const DEFAULT_CONFIG = {
    Icon: CalendarCheck,
    bg: "bg-gray-50",
    icon: "text-gray-400",
    border: "border-gray-200",
    label: "",
  };

  const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
  const { Icon } = cfg;

  return (
    <div
      className={`group relative flex gap-3.5 px-4 py-4 transition-all duration-200
        ${!n.seen ? "bg-white cursor-pointer" : "bg-transparent cursor-default"}
        hover:bg-white/80`}
      onClick={() => !n.seen && onMarkSeen(n._id)}
      role={n.seen ? undefined : "button"}
      tabIndex={n.seen ? undefined : 0}
      onKeyDown={(e) => !n.seen && e.key === "Enter" && onMarkSeen(n._id)}
    >
      {/* Unseen left bar */}
      {!n.seen && (
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-rose-400" />
      )}

      {/* Icon badge */}
      <div
        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
          border ${cfg.bg} ${cfg.border}`}
      >
        <Icon className={`w-4 h-4 ${cfg.icon}`} strokeWidth={1.8} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-7">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] leading-snug
              ${n.seen ? "font-medium text-gray-600" : "font-semibold text-gray-900"}`}
          >
            {n.title}
          </p>
          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 tabular-nums">
            {timeAgo(n.createdAt, lang)}
          </span>
        </div>
        <p className="text-[12px] text-gray-500 leading-relaxed mt-1 line-clamp-2">
          {n.message}
        </p>
      </div>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n._id);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
          opacity-0 group-hover:opacity-100
          text-gray-300 hover:text-red-400 hover:bg-red-50
          transition-all duration-150"
        aria-label={t("notifications.deleteAriaLabel", "Delete notification")}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Group by date ──────────────────────────────────────────────────────────

function groupByDate(
  notifications: TNotification[],
  lang: string,
  t: (key: string, fallback?: string) => string
): { label: string; items: TNotification[] }[] {
  const groups: Record<string, TNotification[]> = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    const key = fmt(d);
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  }

  return Object.entries(groups).map(([key, items]) => {
    const d = new Date(items[0].createdAt);
    let label: string;
    if (key === fmt(today)) {
      label = t("notifications.groupLabels.today", "Today");
    } else if (key === fmt(yesterday)) {
      label = t("notifications.groupLabels.yesterday", "Yesterday");
    } else {
      label = d.toLocaleDateString(lang, { month: "long", day: "numeric" });
    }
    return { label, items };
  });
}

// ── Main panel ─────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  notifications: TNotification[];
  unseenCount: number;
  loading: boolean;
  hasMore: boolean;
  onMarkSeen: (id: string) => void;
  onMarkAllSeen: () => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
};

export function NotificationPanel({
  open,
  onClose,
  notifications,
  unseenCount,
  loading,
  hasMore,
  onMarkSeen,
  onMarkAllSeen,
  onDelete,
  onLoadMore,
}: Props) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.slice(0, 2) || "en";
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node))
        onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const groups = groupByDate(notifications, lang, t);

  const TYPE_CONFIG_FOOTER: Record<
    string,
    { Icon: React.ElementType; icon: string }
  > = {
    new_booking: {
      Icon: CalendarPlus,
      icon: "text-blue-500",
    },
    booking_confirmed: {
      Icon: CalendarCheck2,
      icon: "text-emerald-500",
    },
    booking_cancelled: {
      Icon: CalendarX2,
      icon: "text-red-500",
    },
    booking_completed: {
      Icon: CalendarCheck,
      icon: "text-violet-500",
    },
    no_show: {
      Icon: UserX,
      icon: "text-amber-500",
    },
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300
          ${open
            ? "bg-black/20 backdrop-blur-[2px] pointer-events-auto"
            : "bg-transparent pointer-events-none"
          }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-50 h-full w-[380px] max-w-[100vw] flex flex-col
          bg-[#f8f4f3] border-l border-black/[0.07] shadow-2xl
          transition-transform duration-300 ease-[cubic-bezier(0.65,0,0.35,1)]
          ${open ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[16px] font-bold text-gray-900 tracking-tight">
                {t("notifications.title", "Notifications")}
              </h2>
              {unseenCount > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5
                    rounded-full bg-rose-500 text-white text-[10px] font-bold"
                >
                  {unseenCount > 99 ? "99+" : unseenCount}
                </span>
              )}
            </div>
            {unseenCount > 0 && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                {unseenCount}{" "}
                {unseenCount === 1
                  ? t("notifications.unread", "unread")
                  : t("notifications.unreads", "unreads")}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {unseenCount > 0 && (
              <button
                onClick={onMarkAllSeen}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px]
                  font-semibold text-gray-500 bg-white border border-gray-200
                  hover:border-gray-300 hover:text-gray-800 hover:shadow-sm
                  transition-all duration-150"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("notifications.markAllSeen", "Mark all read")}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl
                text-gray-400 hover:text-gray-700 bg-white border border-gray-200
                hover:border-gray-300 hover:shadow-sm transition-all duration-150"
              aria-label={t("notifications.closeAriaLabel", "Close")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 h-px bg-black/[0.06]" />

        {/* ── List ── */}
        <div className="flex-1 overflow-y-auto">
          {loading && notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p className="text-[12px] font-medium">
                {t("notifications.loading", "Loading…")}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <BellOff className="w-6 h-6 text-gray-300" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-700">
                  {t("notifications.empty", "All caught up")}
                </p>
                <p className="text-[12px] text-gray-400 mt-1">
                  {t("notifications.emptyMessage", "No notifications yet")}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {groups.map(({ label, items }) => (
                <div key={label}>
                  {/* Date group label */}
                  <div className="px-5 py-2.5 sticky top-0 bg-[#f8f4f3]/95 backdrop-blur-sm z-10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-black/[0.04]">
                    {items.map((n) => (
                      <NotificationItem
                        key={n._id}
                        n={n}
                        lang={lang}
                        onMarkSeen={onMarkSeen}
                        onDelete={onDelete}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {/* Load more */}
              {hasMore && (
                <div className="px-5 py-4">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                      text-[12px] font-semibold text-gray-500
                      bg-white border border-gray-200 hover:border-gray-300
                      hover:shadow-sm transition-all duration-150
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : null
                    }
                    {t("notifications.loadMore", "Load more")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {notifications.length > 0 && (
          <div className="shrink-0 px-5 py-3 border-t border-black/[0.06] flex items-center gap-4 flex-wrap">
            {Object.entries(TYPE_CONFIG_FOOTER).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <cfg.Icon className={`w-3 h-3 ${cfg.icon}`} strokeWidth={2} />
                <span className="text-[10px] text-gray-400 font-medium">
                  {t(`notifications.types.${key}`, key)}
                </span>
              </div>
            ))}
            <p className="text-[10px] text-gray-300 ml-auto italic">
              {t("notifications.footerHint", "tap unread to dismiss")}
            </p>
          </div>
        )}
      </div>
    </>
  );
}