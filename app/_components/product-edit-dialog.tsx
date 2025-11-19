"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/actions/products";
import { updateProduct } from "@/app/actions/products";

/**
 * 商品編集ダイアログコンポーネント（Client Component）
 *
 * モーダルダイアログで商品情報を編集:
 * - 編集ボタンクリックでダイアログを表示
 * - フォーム送信で updateProduct Server Action を呼び出し
 * - 成功したらダイアログを閉じる
 *
 * @param product - 編集対象の商品データ
 */
export function ProductEditDialog({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    description: string | null;
  };
}) {
  // ダイアログの開閉状態を管理
  const [isOpen, setIsOpen] = useState(false);

  // useActionState でフォーム状態を管理
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (prevState, formData) => {
      const result = await updateProduct(prevState, formData);

      // 成功したらダイアログを閉じる
      if (result?.success) {
        setIsOpen(false);
      }

      return result;
    },
    null,
  );

  return (
    <>
      {/* 編集ボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        編集
      </button>

      {/* モーダルダイアログ */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">商品を編集</h2>

            <form action={formAction} className="space-y-4">
              {/* 商品ID（hidden） */}
              <input type="hidden" name="id" value={product.id} />

              {/* 商品名入力フィールド */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  商品名
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={product.name}
                  required
                  disabled={isPending}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* 価格入力フィールド */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium mb-1"
                >
                  価格
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={product.price}
                  required
                  min="0"
                  step="1"
                  disabled={isPending}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* 説明入力フィールド */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  説明
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={product.description ?? ""}
                  disabled={isPending}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* エラー表示 */}
              {state && !state.success && (
                <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-semibold mb-1">エラーが発生しました</p>
                  {typeof state.error === "string" ? (
                    <p>{state.error}</p>
                  ) : (
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(state.error, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* ボタンエリア */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? "更新中..." : "更新"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
