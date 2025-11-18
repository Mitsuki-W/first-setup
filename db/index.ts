import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./schemas/auth";
import * as productsSchema from "./schemas/products";

/**
 * Next.js の開発環境でのホットリロード対策
 *
 * 問題: Next.js の開発モードでは、ファイル変更のたびにモジュールが再読み込みされ、
 *       新しい DB 接続が作成されてしまう。これにより接続数が上限に達し、
 *       ECONNRESET エラーが発生する。
 *
 * 解決策: globalThis を使って接続インスタンスを保持し、再利用する。
 *        本番環境では毎回新しい接続を作成する。
 */
declare global {
  var __db: ReturnType<typeof postgres> | undefined;
}

/**
 * DATABASE_URL の存在チェック
 * non-null assertion (!) を避けるため、明示的にチェックしてエラーを投げる
 */
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

/**
 * postgres-js クライアントの接続設定
 *
 * - max: 1
 *   開発環境では接続プールを1に制限。複数の接続が同時に開かれるのを防ぐ。
 *
 * - idle_timeout: 20
 *   アイドル状態の接続を20秒後に自動的に閉じる。
 *   リソースの無駄遣いを防ぎ、接続リークを回避する。
 *
 * - connect_timeout: 10
 *   接続確立のタイムアウトを10秒に設定。
 *   DBサーバーが応答しない場合に早期に失敗させる。
 *
 * - ssl: false
 *   ローカル開発環境ではSSL接続を無効化。
 *   Supabaseローカル環境はSSLを必要としないため、有効にするとECONNRESETエラーが発生する。
 */
const client =
  globalThis.__db ||
  postgres(process.env.DATABASE_URL, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: false,
  });

/**
 * 開発環境でのみ接続をグローバル変数に保存
 * 本番環境では毎回新しい接続を作成するため、保存しない
 */
if (process.env.NODE_ENV !== "production") {
  globalThis.__db = client;
}

export const db = drizzle({
  client,
  schema: {
    ...authSchema,
    ...productsSchema,
  },
});
