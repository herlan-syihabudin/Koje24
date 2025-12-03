import InvoiceClientContent from "../InvoiceClientContent";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  // 🔥 fetch langsung ke API relatif — AMAN untuk Vercel & localhost
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/invoice/${id}`, {
    cache: "no-store",
  }).catch(() => null);

  // 🔰 jika request gagal total (server down)
  if (!res) return notFound();

  // 🔰 jika API tidak response OK
  if (!res.ok) return notFound();

  const data = await res.json();

  // 🔰 jika invoice tidak ditemukan
  if (!data?.success || !data?.data) return notFound();

  return <InvoiceClientContent invoice={data.data} />;
}
