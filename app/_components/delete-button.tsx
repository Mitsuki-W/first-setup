"use client";

import { useActionState } from "react";
import { deleteProduct } from "@/app/actions/products";

/**
 * 商品削除ボタンコンポーネント（Client Component）
 *
 * useActionState を使って削除処理を実行:
 * - ボタンクリックで削除確認
 * - 確認後、Server Action (deleteProduct) を実行
 * - 削除中は isPending で状態を管理
 *
 * @param productId - 削除する商品のID
 * @param productName - 削除する商品の名前（確認メッセージ用）
 */
export function DeleteButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  // Server Action をラップした関数を作成
  const deleteProductWithId = async () => {
    // 削除確認ダイアログ
    const confirmed = window.confirm(
      `「${productName}」を削除してもよろしいですか？`,
    );

    if (!confirmed) {
      // キャンセルされた場合は何もしない
      return { success: false as const, error: "キャンセルされました" };
    }

    // 削除を実行
    return await deleteProduct(productId);
  };

  const [state, formAction, isPending] = useActionState(
    deleteProductWithId,
    null,
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "削除中..." : "削除"}
      </button>

      {/* エラー表示 */}
      {state && !state.success && state.error !== "キャンセルされました" && (
        <p className="text-xs text-red-600 mt-1">{String(state.error)}</p>
      )}
    </form>
  );
}
