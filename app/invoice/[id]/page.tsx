import InvoiceClientContent from "../InvoiceClientContent";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invoice/${id}`, {
    cache: "no-store",
  });

  const data = await res.json();
  if (!data?.success) return notFound();

  return <InvoiceClientContent invoice={data.data} />;
}