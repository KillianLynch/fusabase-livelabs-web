import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query
} from "fusabase/oracledb";

// ── Pre-built support helper ───────────────────────

export async function loadRecipeDetail(db, recipeId) {
  const recipesRef = collection(db, "recipes");
  const recipeRef = doc(recipesRef, recipeId);
  const snap = await getDoc(recipeRef);

  if (!snap.exists()) return null;

  const ratingsSnap = await getDocs(
    query(collection(recipeRef, "ratings"), limit(20))
  );
  const ratings = ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return {
    recipe: { id: snap.id, ...snap.data() },
    ratings
  };
}
