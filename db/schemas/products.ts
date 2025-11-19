import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"; // Drizzle ORM のテーブル定義用の型
import { createInsertSchema } from "drizzle-zod"; // Drizzle のテーブル定義から Zod スキーマを自動生成
import { nanoid } from "nanoid"; // ユニークなID生成用
import { z } from "zod"; // バリデーションライブラリ

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"), // 論理削除用: NULL = 未削除、日付あり = 削除済み
});

/**
 * 商品作成時のバリデーションスキーマ
 * - name: 必須の文字列（Drizzle 定義から自動反映）
 * - price: 文字列でもOK → number に変換して、0以上の整数に制限
 * - id / createdAt / updatedAt / deletedAt は自動なので除外
 */
export const insertProductSchema = createInsertSchema(products, {
  price: z.coerce.number().int().nonnegative(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true, // 削除フラグはフォームから入力しない
});

/**
 * 商品更新時のバリデーションスキーマ
 * - insertProductSchema をベースに、全フィールドをオプションにする
 * - 部分的な更新が可能
 */
export const updateProductSchema = insertProductSchema.partial();

/**
 * TypeScript 型定義
 * - InsertProduct: 商品作成時の型
 * - UpdateProduct: 商品更新時の型
 */
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
