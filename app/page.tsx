import { ProductList } from "@/app/_components/product-list";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">商品管理</h1>

      {/* 商品一覧 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">商品一覧</h2>
        <ProductList />
      </div>
    </div>
  );
}
