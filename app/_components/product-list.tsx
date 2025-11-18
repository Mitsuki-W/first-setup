import { DeleteButton } from "@/app/_components/delete-button";
import { getProducts } from "@/app/actions/products";

/**
 * 商品一覧コンポーネント（Server Component）
 *
 * Server Componentとして実装:
 * - サーバー側でgetProducts()を実行してデータを取得
 * - 取得したデータをテーブル形式で表示
 * - "use client" がないので、サーバーでのみレンダリングされる
 *
 * 表示内容:
 * - 商品名
 * - 価格
 * - 作成日時（フォーマット済み）
 * - 削除ボタン（DeleteButton コンポーネント）
 */
export async function ProductList() {
  // サーバー側でServer Actionを呼び出してデータ取得
  const result = await getProducts();

  // エラーハンドリング
  if (!result.success) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4 text-red-700">
        エラー: {String(result.error)}
      </div>
    );
  }

  const products = result.data;

  // 商品が0件の場合
  if (products.length === 0) {
    return (
      <div className="rounded border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
        商品がまだ登録されていません
      </div>
    );
  }

  // 商品一覧をテーブルで表示
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2 text-left">
              商品名
            </th>
            <th className="border border-gray-300 px-4 py-2 text-right">
              価格
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left">
              登録日時
            </th>
            <th className="border border-gray-300 px-4 py-2 text-center">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">
                {product.name}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right">
                ¥{product.price.toLocaleString()}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                {new Date(product.createdAt).toLocaleString("ja-JP")}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <DeleteButton
                  productId={product.id}
                  productName={product.name}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
