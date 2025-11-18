import { ProductForm } from "@/app/_components/product-form";
import { ProductList } from "@/app/_components/product-list";

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">商品管理</h1>

      {/* 商品追加フォーム */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">新規商品追加</h2>
        <div className="max-w-md">
          <ProductForm />
        </div>
      </div>

      {/* 商品一覧 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">商品一覧</h2>
        <ProductList />
      </div>
    </div>
  );
}
