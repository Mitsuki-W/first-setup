"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/actions/products";
import { createProduct } from "@/app/actions/products";

/**
 * 商品追加フォームコンポーネント（Client Component）
 *
 * useActionStateフックを使用してServer Actionと連携:
 * - フォーム送信時に createProduct Server Action を呼び出し
 * - サーバーからのレスポンス（成功/失敗）を state で受け取る
 * - エラーがあれば表示、成功したらフォームをリセット
 *
 * 実装のポイント:
 * - "use client" ディレクティブで Client Component として定義
 * - useActionState は React 19 の新しいフック (旧 useFormState)
 * - Server Action との連携により、JavaScript なしでも動作可能
 */
export function ProductForm() {
  // useActionState でフォーム状態を管理
  // state: Server Action からの戻り値（成功/失敗情報）
  // formAction: フォームの action 属性に渡す関数
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    createProduct,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* 商品名入力フィールド */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          商品名
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          disabled={isPending}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="商品名を入力"
        />
      </div>

      {/* 価格入力フィールド */}
      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          価格
        </label>
        <input
          id="price"
          name="price"
          type="number"
          required
          min="0"
          step="1"
          disabled={isPending}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="価格を入力"
        />
      </div>

      {/* 説明入力フィールド */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          disabled={isPending}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder="商品の説明を入力"
        />
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "追加中..." : "商品を追加"}
      </button>

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

      {/* 成功メッセージ */}
      {state?.success && state.message && (
        <div className="rounded border border-green-300 bg-green-50 p-3 text-sm text-green-700">
          {state.message}
        </div>
      )}
    </form>
  );
}
