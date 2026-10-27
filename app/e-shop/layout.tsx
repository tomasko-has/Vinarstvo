import { ShopNav } from "@/components/shop/ShopNav";

export default function ShopLayout({ children }: LayoutProps<"/e-shop">) {
  return (
    <>
      <ShopNav />
      {children}
    </>
  );
}
