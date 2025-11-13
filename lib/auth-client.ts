import { inferAdditionalFields } from "better-auth/client/plugins"; // サーバー側の認証設定から追加フィールドの型を推論するプラグインをインポート
import { createAuthClient } from "better-auth/react"; // React用の認証クライアント作成関数をインポート
import type { auth } from "@/lib/auth"; // サーバー側の認証インスタンスをインポート（型推論用）
import { getBaseURL } from "@/lib/get-base-url"; // ベースURLを取得するユーティリティ関数をインポート

export const authClient = createAuthClient({
  // クライアント側で使用する認証クライアントのインスタンスを作成してエクスポート
  baseURL: getBaseURL(), // 認証APIのベースURLを設定（環境に応じて動的に取得）
  plugins: [inferAdditionalFields<typeof auth>()], // サーバー側の認証設定から自動的に型情報を推論するプラグインを追加
});
