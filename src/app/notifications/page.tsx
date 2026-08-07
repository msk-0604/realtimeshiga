import type { Metadata } from "next";
import { NotificationsClient } from "@/components/notifications/NotificationsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "通知",
};

export default function NotificationsPage() {
  return (
    <div className="page-wrap">
      <NotificationsClient />
    </div>
  );
}
