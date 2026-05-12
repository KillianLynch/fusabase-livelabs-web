import {
  addDoc,
  collection,
  getOracledb,
  Timestamp
} from "fusabase/oracledb";
import { initializeApp } from "fusabase/app";
import { demoRecipes } from "./mock.js";

export async function seedDemoRecipes(config) {
  const app = initializeApp(config);
  const db = getOracledb(app);
  const recipesRef = collection(db, "recipes");

  for (const recipe of demoRecipes) {
    await addDoc(recipesRef, {
      ...recipe,
      createdAt: Timestamp.fromMillis(recipe.createdAt)
    });
  }
}
