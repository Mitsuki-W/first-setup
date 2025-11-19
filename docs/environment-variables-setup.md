# 環境変数セットアップガイド

このドキュメントでは、CI/CDパイプラインとVercelで使用する環境変数の設定方法を説明します。

## 概要

このプロジェクトでは、開発環境（Development）と本番環境（Production）で異なる環境変数を使用します。

- **Development環境**: ビルドチェック、開発用デプロイで使用
- **Production環境**: 本番デプロイ、本番DBマイグレーションで使用

---

## 1. GitHub Secretsの設定

CI/CDパイプライン（`.github/workflows/pipeline.yml`）で使用する環境変数を設定します。

### 設定場所

1. GitHubリポジトリページを開く
2. 「**Settings**」タブをクリック
3. 左サイドバーの「**Secrets and variables**」→「**Actions**」をクリック
4. 「**New repository secret**」ボタンをクリック

### Development用環境変数（buildジョブで使用）

以下の5つのSecretsを登録します：

#### DEV_NEXT_PUBLIC_SUPABASE_URL
- **値**: SupabaseプロジェクトURL
- **例**: `https://xxxxxxxxxxxxx.supabase.co`
- **取得方法**: Supabase Dashboard → Project Settings → API → Project URL

#### DEV_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- **値**: Supabase公開可能APIキー
- **取得方法**: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`

#### DEV_SUPABASE_SECRET_KEY
- **値**: Supabaseシークレットキー
- **取得方法**: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`

#### DEV_DATABASE_URL
- **値**: PostgreSQL接続文字列
- **形式**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **取得方法**: Supabase Dashboard → Project Settings → Database → Connection string → URI
- **注意**: `[YOUR-PASSWORD]`を実際のパスワードに置き換える

#### DEV_BETTER_AUTH_SECRET
- **値**: Better Auth用シークレットキー
- **生成方法**:
ベースURL取得用関数の導入
    pnpx shadcn@latest add https://registry.dninomiya.com/r/get-base-url.json

Better Authのインストール
    pnpm add better-auth nanoid

ハッシュ用シークレットの生成と環境変数への追加
    pnpx @better-auth/cli@latest secret

→生成されたものを貼る

### Production用環境変数（migrateジョブで使用）

#### PROD_DATABASE_URL
- **値**: 本番用PostgreSQL接続文字列
- **形式**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **注意**: 現時点で本番用DBが別にない場合は、`DEV_DATABASE_URL`と同じ値でOK

---

## 2. Vercelの環境変数設定

Vercelにデプロイされたアプリケーションで使用する環境変数を設定します。

### 設定場所

1. Vercel Dashboardを開く
2. プロジェクトを選択
3. 「**Settings**」タブをクリック
4. 左サイドバーの「**Environment Variables**」をクリック

### Preview / Development環境用

以下の5つの環境変数を登録し、適用環境として「**Preview**」と「**Development**」を選択します：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 開発用SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 開発用Supabase公開キー |
| `SUPABASE_SECRET_KEY` | 開発用Supabaseシークレットキー |
| `DATABASE_URL` | 開発用PostgreSQL接続文字列 |
| `BETTER_AUTH_SECRET` | 開発用Better Authシークレット |

### Production環境用

以下の5つの環境変数を登録し、適用環境として「**Production**」を選択します：

| 変数名 | 値 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 本番用SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 本番用Supabase公開キー |
| `SUPABASE_SECRET_KEY` | 本番用Supabaseシークレットキー |
| `DATABASE_URL` | 本番用PostgreSQL接続文字列 |
| `BETTER_AUTH_SECRET` | 本番用Better Authシークレット |

**注意**: `BETTER_AUTH_SECRET`は環境ごとに異なる値を使用してください（開発用と本番用で別々に生成）

---

## 3. CI/CDパイプラインの動作

### 全ブランチ共通

どのブランチにpushしても、以下のジョブが実行されます：

1. **lint**: Biomeによるコード品質チェック
2. **typecheck**: TypeScript型チェック
3. **build**: Next.jsビルド（Development環境変数を使用）

### mainブランチのみ

mainブランチにpushまたはマージすると、上記に加えて以下が実行されます：

4. **migrate**: データベースマイグレーション（Production環境変数を使用）

### パイプラインの流れ

```
lint → typecheck → build → migrate（mainのみ）
```

前のジョブが失敗すると、後続のジョブはスキップされます。

---

## 4. ローカル開発環境の設定

ローカルで開発する場合は、プロジェクトルートに`.env`ファイルを作成します。

### .envファイルの作成

```bash
cp .env.example .env
```

### .envファイルの編集

`.env.example`に記載されている環境変数に、実際の値を設定します：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
SUPABASE_SECRET_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:xxxxx@localhost:54322/postgres
BETTER_AUTH_SECRET=xxxxxxxxxx
```

**注意**: `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。

---

## 5. セキュリティ注意事項

- シークレットキーは絶対にGitにコミットしない
- Development環境とProduction環境で異なる値を使用する
- `BETTER_AUTH_SECRET`は環境ごとに新規生成する
- `DATABASE_URL`には本番データベースの認証情報が含まれるため厳重に管理
- Supabaseの`service_role`キーは管理者権限を持つため、公開しない

---

## トラブルシューティング

### GitHub Actionsでbuildが失敗する

- GitHub Secretsに`DEV_*`プレフィックスの環境変数が正しく設定されているか確認
- Secretsの値に余分なスペースや改行が含まれていないか確認

### GitHub Actionsでmigrateが失敗する

- `PROD_DATABASE_URL`が正しく設定されているか確認
- データベースへの接続が許可されているか確認（SupabaseのNetwork設定）

### Vercelデプロイでエラーが発生する

- Vercelの環境変数が正しい環境（Preview/Production）に設定されているか確認
- 環境変数名にタイポがないか確認
