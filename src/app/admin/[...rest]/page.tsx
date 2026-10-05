import { notFound } from "next/navigation";

/** Mọi đường dẫn /admin/* không khớp route → hiển thị not-found của khu vực admin (trong shell). */
export default function AdminCatchAllPage() {
  notFound();
}
