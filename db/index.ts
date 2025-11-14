import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as authSchema from "./schemas/auth";
import * as productsSchema from "./schemas/products";

config({ path: ".env" });

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle({
  client,
  schema: {
    ...authSchema,
    ...productsSchema,
  },
});
