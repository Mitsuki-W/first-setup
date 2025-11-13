import { betterAuth } from "better-auth"; // better-authライブラリから認証機能の本体をインポート
import { drizzleAdapter } from "better-auth/adapters/drizzle"; // DrizzleORMとbetter-authを連携させるアダプタをインポート
import { nextCookies } from "better-auth/next-js"; // Next.jsのクッキー処理を行うプラグインをインポート
import { nanoid } from "nanoid"; // ユニークなIDを生成するためのnanoidライブラリをインポート
import { db } from "@/db"; // プロジェクトのデータベース接続インスタンスをインポート
import * as schema from "@/db/schemas/auth"; // 認証関連のデータベーススキーマ定義（users、sessionsなど）をインポート
import { getBaseURL } from "@/lib/get-base-url"; // ベースURLを取得するユーティリティ関数をインポート

export const auth = betterAuth({
  // 認証システムのインスタンスを作成してエクスポート
  baseURL: getBaseURL(), // 認証システムのベースURLを設定（環境に応じて動的に取得）
  database: drizzleAdapter(db, {
    // データベースアダプタを設定してDrizzle ORMと連携
    provider: "pg", // PostgreSQLデータベースを使用することを指定
    usePlural: true, // テーブル名を複数形で扱うことを指定（例: user → users）
    schema, // インポートした認証スキーマをアダプタに渡してテーブル構造を定義
  }),
  advanced: {
    // 高度な設定オプション
    database: {
      // データベース関連の詳細設定
      generateId: () => nanoid(10), // 新しいレコードのIDを10文字のnanoidで生成する関数を指定
    },
  },
  plugins: [nextCookies()], // Next.jsのクッキー処理を有効にするプラグインを追加
});
