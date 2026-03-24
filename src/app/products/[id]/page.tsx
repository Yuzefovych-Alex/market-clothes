import Link from "next/link";
import { notFound } from "next/navigation";
import DescriptionProduct from "../../components/DescriptionProduct/DescriptionProduct";
import Footer from "../../components/Footer/Footer";
import HeaderProduct from "../../components/HeaderProduct/HeaderProduct";
import { fetchProduct } from "@/lib/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) notFound();

  return (
    <div className="product">
      <div className="product__container">
        <HeaderProduct />
        <DescriptionProduct product={product} />
        <p className="mt-6 text-center text-[0.65rem] uppercase tracking-wide text-neutral-500">
          <Link href="/" className="underline underline-offset-2 hover:opacity-70">
            ← В каталог
          </Link>
        </p>
        <Footer />
      </div>
    </div>
  );
}
