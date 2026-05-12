import { fusabaseConfig } from "../fusabase-config.js";
import { initializeApp } from "fusabase/app";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getOracledb,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from "fusabase/oracledb";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "fusabase/auth";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from "fusabase/storage";
import { loadRecipeDetail } from "./data.js";
import { seedDemoRecipes } from "./seed.js";
import {
  renderAuthState,
  renderRecipeDetail,
  renderRecipeList,
  renderStatus
} from "./view.js";

// ── SDK state ──────────────────────────────────────

let app;
let db;
let auth;
let storage;

// ── App state ──────────────────────────────────────

const state = {
  filters: { category: "" },
  recipes: [],
  activeRecipeId: null,
  currentUser: null,
  editingRecipeId: null
};

// ── Elements ────────────────────────────────────────

const el = {
  seedButton: document.querySelector("#seedButton"),
  refreshButton: document.querySelector("#refreshButton"),
  statusBanner: document.querySelector("#statusBanner"),
  recipeForm: document.querySelector("#recipeForm"),
  recipeList: document.querySelector("#recipeList"),
  recipeDetail: document.querySelector("#recipeDetail"),
  ratingForm: document.querySelector("#ratingForm"),
  recipeCount: document.querySelector("#recipeCount"),
  // Modal elements
  uploadRecipeButton: document.querySelector("#uploadRecipeButton"),
  recipeModal: document.querySelector("#recipeModal"),
  modalCloseButton: document.querySelector("#modalCloseButton"),
  // Category pills
  categoryPills: document.querySelector("#categoryPills"),
  // Auth elements
  authSection: document.querySelector("#authSection"),
  authSignedOut: document.querySelector("#authSignedOut"),
  authSignedIn: document.querySelector("#authSignedIn"),
  authToggleButton: document.querySelector("#authToggleButton"),
  authPopup: document.querySelector("#authPopup"),
  authEmail: document.querySelector("#authEmail"),
  authPassword: document.querySelector("#authPassword"),
  authUserEmail: document.querySelector("#authUserEmail"),
  signInButton: document.querySelector("#signInButton"),
  signUpButton: document.querySelector("#signUpButton"),
  signOutButton: document.querySelector("#signOutButton"),
  // Photo field (hidden until Lab 6)
  modalPhotoField: document.querySelector("#modalPhotoField"),
  // Write form elements
  recipeFields: document.querySelector("#recipeFields"),
  recipeAuthPrompt: document.querySelector("#recipeAuthPrompt"),
  ratingFields: document.querySelector("#ratingFields"),
  ratingAuthPrompt: document.querySelector("#ratingAuthPrompt")
};

// ── Write form visibility ───────────────────────────

function syncWriteForms() {
  const signedIn = state.currentUser !== null;
  el.recipeFields.disabled = !signedIn;
  el.ratingFields.disabled = !signedIn;
  el.recipeAuthPrompt.hidden = signedIn;
  el.ratingAuthPrompt.hidden = signedIn;
}

function hasCompleteConfig(config = fusabaseConfig) {
  const requiredKeys = [
    "schema",
    "app_id",
    "project_id",
    "storage_bucket",
    "auth_id",
    "ords_host"
  ];

  return requiredKeys.every((key) => Boolean(config[key]));
}

function recipeInputFromForm(formData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? "Dinner"),
    prepTime: String(formData.get("prepTime") ?? "30"),
    instructions: String(formData.get("instructions") ?? ""),
    ingredients: parseIngredients(formData.get("ingredients"))
  };
}

function parseIngredients(raw) {
  return String(raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// ── Modal helpers ───────────────────────────────────

function openModal(recipe = null) {
  state.editingRecipeId = recipe?.id ?? null;

  if (recipe) {
    document.querySelector("#recipeTitle").value = recipe.title ?? "";
    document.querySelector("#recipeDescription").value = recipe.description ?? "";
    document.querySelector("#recipeCategory").value = recipe.category ?? "Dinner";
    document.querySelector("#recipePrepTime").value = recipe.prepTime ?? 30;
    document.querySelector("#recipeIngredients").value = (recipe.ingredients ?? []).join("\n");
    document.querySelector("#recipeInstructions").value = recipe.instructions ?? "";
  } else {
    el.recipeForm.reset();
  }
  el.recipeModal.hidden = false;
}

function closeModal() {
  state.editingRecipeId = null;
  el.recipeModal.hidden = true;
}

// ── Core actions ────────────────────────────────────

async function refreshRecipes(selectRecipeId = state.activeRecipeId) {
  let result = null;

  const constraints = [];

  if (state.filters.category) {
    constraints.push(where("category", "==", state.filters.category));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(24));

  const snapshot = await getDocs(
    query(collection(db, "recipes"), ...constraints)
  );

  result = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

  const recipes = result ?? [];
  state.recipes = recipes;

  el.seedButton.hidden = result === null || recipes.length > 0;
  el.recipeCount.textContent = recipes.length;

  if (!recipes.length) {
    state.activeRecipeId = null;
    renderRecipeList(el.recipeList, recipes, null);
    renderRecipeDetail(el.recipeDetail, null);
    el.ratingForm.hidden = true;
    return;
  }

  const preferredId = recipes.some((r) => r.id === selectRecipeId)
    ? selectRecipeId
    : recipes[0].id;

  state.activeRecipeId = preferredId;
  renderRecipeList(el.recipeList, recipes, preferredId);
  await showRecipeDetail(preferredId);
}

async function showRecipeDetail(recipeId) {
  const detail = await loadRecipeDetail(db, recipeId).catch(() => null);
  renderRecipeDetail(el.recipeDetail, detail, state.currentUser?.email);
  renderRecipeList(el.recipeList, state.recipes, recipeId);
  el.ratingForm.hidden = !detail;
}

async function connectAndLoad() {
  app = initializeApp(fusabaseConfig);
  db = getOracledb(app);
  await refreshRecipes();
}

// ── Event binding ───────────────────────────────────

function bindEvents() {
  el.seedButton.addEventListener("click", () => {
    runAction("Demo recipes loaded.", async () => {
      await seedDemoRecipes(fusabaseConfig);
      await refreshRecipes();
    });
  });

  el.refreshButton.addEventListener("click", () => {
    runAction("Recipe query refreshed.", refreshRecipes);
  });

  // ── Modal events ──────────────────────────────

  el.uploadRecipeButton.addEventListener("click", openModal);
  el.modalCloseButton.addEventListener("click", closeModal);

  el.recipeModal.addEventListener("click", (event) => {
    if (event.target === el.recipeModal) closeModal();
  });

  // ── Category pills ────────────────────────────

  el.categoryPills.addEventListener("click", (event) => {
    const pill = event.target.closest("[data-category]");
    if (!pill) return;

    el.categoryPills.querySelectorAll(".pill").forEach((p) => p.classList.remove("pill-active"));
    pill.classList.add("pill-active");

    state.filters.category = pill.dataset.category;
    runAction("Recipe query updated.", refreshRecipes);
  });

  // ── Recipe form (in modal) ────────────────────

  el.recipeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fd = new FormData(el.recipeForm);
    const formInput = recipeInputFromForm(fd);

    if (state.editingRecipeId) {
      runAction("Recipe updated.", async () => {
        // ── Lab 7 TODO: Edit a recipe with the SDK ───
        // Use doc() to point at this recipe, then call updateDoc().
        //
        // const recipeRef = doc(collection(db, "recipes"), state.editingRecipeId);
        // await updateDoc(recipeRef, {
        //   title: formInput.title.trim(),
        //   description: formInput.description.trim(),
        //   category: formInput.category,
        //   prepTime: Number(formInput.prepTime),
        //   instructions: formInput.instructions.trim()
        // });
        throw new Error("Complete Lab 7 to edit recipes.");

        el.recipeForm.reset();
        const editedId = state.editingRecipeId;
        closeModal();
        await refreshRecipes(editedId);
      });
    } else {
      runAction("Recipe created.", async () => {
        let recipeRef = null;

        // ── Lab 5 TODO: Create recipes with the SDK ──
        // Use addDoc(collection(db, "recipes"), data) to save this form.
        recipeRef = await addDoc(collection(db, "recipes"), {
          title: formInput.title.trim(),
          description: formInput.description.trim(),
          category: formInput.category,
          prepTime: Number(formInput.prepTime),
          instructions: formInput.instructions.trim(),
          createdAt: Timestamp.now(),
          ingredients: formInput.ingredients,
          createdBy: auth.currentUser.email,
          ownerId: auth.currentUser.uid
        });

        const photoFile = fd.get("photo");
        if (photoFile && photoFile.size > 0) {
          // ── Lab 6 TODO: Upload the new recipe photo with the SDK ──
          // After adding this code, remove hidden from #modalPhotoField in index.html.
          storage = getStorage(app);
          const photoRef = ref(storage, `recipes/${recipeRef.id}/${photoFile.name}`);
          await uploadBytes(photoRef, photoFile, { contentType: photoFile.type || "image/png" });
          const photoURL = await getDownloadURL(photoRef);
          await updateDoc(doc(collection(db, "recipes"), recipeRef.id), { photoURL });
        }
        el.recipeForm.reset();
        closeModal();
        await refreshRecipes(recipeRef.id);
      });
    }
  });

  // ── Recipe list click ─────────────────────────

  el.recipeList.addEventListener("click", (event) => {
    const target = event.target.closest("[data-recipe-id]");
    if (!target) return;
    const recipeId = target.getAttribute("data-recipe-id");
    if (!recipeId) return;
    runAction("Loaded recipe details.", async () => {
      state.activeRecipeId = recipeId;
      await showRecipeDetail(recipeId);
    });
  });

  // ── Edit button (in detail panel) ───────────

  el.recipeDetail.addEventListener("click", (event) => {
    const editBtn = event.target.closest("[data-edit-recipe]");
    if (!editBtn) return;
    const recipeId = editBtn.dataset.editRecipe;
    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (recipe) openModal(recipe);
  });

  // ── Rating form ───────────────────────────────

  el.ratingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const fd = new FormData(el.ratingForm);
    runAction("Rating saved.", async () => {
      // ── Lab 5 TODO: Add ratings with the SDK ─────
      // Use doc() and addDoc(collection(recipeRef, "ratings"), ...) to save
      // a rating into the recipe's ratings subcollection.
      const recipeRef = doc(collection(db, "recipes"), state.activeRecipeId);

      await addDoc(collection(recipeRef, "ratings"), {
        author: auth.currentUser.email,
        rating: Number(fd.get("rating") ?? "5"),
        comment: String(fd.get("comment") ?? "").trim()
      });

      el.ratingForm.reset();
      await refreshRecipes(state.activeRecipeId);
    });
  });

  // ── Auth events ───────────────────────────────

  el.authToggleButton.addEventListener("click", () => {
    el.authPopup.hidden = !el.authPopup.hidden;
  });

  document.addEventListener("click", (event) => {
    if (!el.authPopup.hidden && !el.authSection.contains(event.target)) {
      el.authPopup.hidden = true;
    }
  });

  el.signInButton.addEventListener("click", () => {
    runAction("Signed in.", async () => {
      // ── Lab 4 TODO: Sign in with the SDK ─────────
      await signInWithEmailAndPassword(auth, el.authEmail.value, el.authPassword.value);

      el.authEmail.value = "";
      el.authPassword.value = "";
    });
  });

  el.signUpButton.addEventListener("click", () => {
    runAction("Account created.", async () => {
      // ── Lab 4 TODO: Create an account with the SDK ─
      await createUserWithEmailAndPassword(auth, el.authEmail.value, el.authPassword.value);

      el.authEmail.value = "";
      el.authPassword.value = "";
    });
  });

  el.signOutButton.addEventListener("click", () => {
    runAction("Signed out.", async () => {
      // ── Lab 4 TODO: Sign out with the SDK ────────
      await signOut(auth);
    });
  });
}

// ── Error wrapper ───────────────────────────────────

async function runAction(successMsg, fn) {
  renderStatus(el.statusBanner, "Working with the backend...", "info");
  try {
    await fn();
    renderStatus(el.statusBanner, successMsg, "success");
  } catch (e) {
    renderStatus(
      el.statusBanner,
      e instanceof Error ? e.message : "Unexpected error",
      "error"
    );
  }
}

// ── Boot ────────────────────────────────────────────

async function main() {
  bindEvents();
  syncWriteForms();

  if (!hasCompleteConfig()) {
    renderStatus(
      el.statusBanner,
      "Continue with Lab 2, Task 3 in the workshop guide to connect this app to Fusabase.",
      "info"
    );
    return;
  }

  await runAction("Connected to Fusabase.", connectAndLoad);

  // ── Lab 4 TODO: Start auth with the SDK ─────────
  auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    state.currentUser = user;
    renderAuthState(el, user);
    syncWriteForms();
  });
}

main();
