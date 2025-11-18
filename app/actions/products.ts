/**
 * Server Actions ファイル
 *
 * "use server" ディレクティブ:
 * - このファイル内のすべての関数をServer Actionとしてマーク
 * - これらの関数はサーバーサイドでのみ実行され、クライアントから安全に呼び出せる
 * - FormDataを直接受け取ることができ、データベース操作が可能
 */
"use server";

import { eq } from "drizzle-orm"; // Drizzle で SQL の WHERE 条件を書くための関数（例: WHERE id = 'abc123' → eq(products.id, 'abc123')）
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { insertProductSchema, products } from "@/db/schemas/products";

/**
 * フォーム状態の型定義
 *
 * useFormStateフックで使用される型
 * - success: 処理が成功したかどうかのフラグ
 * - message: 成功時のメッセージ（例: "商品を追加しました"）
 * - error: エラー発生時のメッセージまたはZodバリデーションエラーの詳細
 * - null: 初期状態（まだフォーム送信されていない）
 */
export type FormState = {
  success: boolean;
  message?: string;
  error?: string | Record<string, unknown>;
} | null;

/**
 * 商品一覧を取得（通常のサーバー関数）
 *
 * Server Componentから直接呼び出される非同期関数
 *
 * 処理フロー:
 * 1. データベースからproductsテーブルの全レコードを取得
 * 2. createdAt（作成日時）の昇順でソート
 * 3. 成功時: { success: true, data: 商品配列 } を返す
 * 4. エラー時: エラーをログ出力し、{ success: false, error: エラーメッセージ } を返す
 *
 * @returns 商品一覧の取得結果
 */
export async function getProducts() {
  try {
    // データベースから商品一覧を取得（作成日時の古い順）
    /**
     * .select().from(table)のチェーン構文 → Drizzle
     * products.createdAt を直接参照してもコンパイルエラーが起きず、
     * 型が確実に保証されるのはDrizzleが型レベルでテーブル定義をそのまま保持しているからです。
     * db.select().from(products) と書いただけで：
        テーブルのカラム名
        カラムの型
        null / not null
     * すべて TypeScript が完全に推論してくれる
     */
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(products.createdAt);

    return { success: true as const, data: allProducts };
  } catch (error) {
    console.error("商品一覧取得エラー:", error);
    return { success: false as const, error: "商品一覧の取得に失敗しました" };
  }
}

/**
 * 商品を作成（Server Action + useFormState 用）
 *
 * useFormStateフックと組み合わせて使用するServer Action
 *
 * 処理フロー:
 * 1. FormDataからフォーム入力値を取得
 * 2. Zodスキーマ（insertProductSchema）でバリデーション
 *    - name: 必須文字列
 *    - price: 数値に変換して0以上の整数であることを検証
 * 3. バリデーション成功時: データベースに商品を挿入
 * 4. revalidatePath("/")でトップページのキャッシュを無効化（最新データを表示）
 * 5. 成功/失敗の結果をFormStateとして返す
 *
 * @param _prevState - 前回のフォーム状態（useFormStateが渡す。今回は使用しないためアンダースコアプレフィックス）
 * @param formData - フォームから送信されたデータ（name, priceを含む）
 * @returns フォームの新しい状態（成功/失敗、メッセージ、エラー詳細）
 */
export async function createProduct(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    // FormDataをオブジェクトに変換（例: { name: "商品名", price: "1000" }）
    const raw = Object.fromEntries(formData);

    // Zodスキーマでバリデーション
    const result = insertProductSchema.safeParse(raw);
    if (!result.success) {
      // バリデーションエラー時: エラー詳細を返す
      return {
        success: false,
        error: result.error.format(),
      };
    }

    // データベースに商品を挿入
    await db.insert(products).values(result.data);

    // トップページのキャッシュを無効化（再レンダリングで最新データを表示）
    revalidatePath("/");

    return {
      success: true,
      message: "商品を追加しました",
    };
  } catch (error) {
    console.error("商品作成エラー:", error);
    return {
      success: false,
      error: "商品の作成に失敗しました",
    };
  }
}

/**
 * 商品を削除（Server Action）
 *
 * 指定されたIDの商品をデータベースから削除する
 *
 * 処理フロー:
 * 1. 引数で受け取ったIDをもとに、商品を削除
 * 2. Drizzle ORM の eq() 関数で WHERE 条件を指定
 * 3. データベースから削除を実行
 * 4. revalidatePath("/") でトップページのキャッシュを無効化
 * 5. 成功/失敗の結果を返す
 *
 * @param id - 削除する商品のID
 * @returns 削除結果 { success: true } または { success: false, error: エラーメッセージ }
 */
export async function deleteProduct(id: string) {
  try {
    // データベースから商品を削除
    // eq(products.id, id) → WHERE id = '指定されたID'
    await db.delete(products).where(eq(products.id, id));

    // トップページのキャッシュを無効化（一覧を最新化）
    revalidatePath("/");

    return { success: true as const };
  } catch (error) {
    console.error("商品削除エラー:", error);
    return { success: false as const, error: "商品の削除に失敗しました" };
  }
}
