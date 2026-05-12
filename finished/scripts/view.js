function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCreatedAt(value) {
  if (value == null) return "—";
  // Fusabase Timestamp instance — has .toDate()
  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }
  // Read-back can also arrive as the serialized string
  // (e.g. "2026-05-06T12:09:44.000000"). Trim microseconds beyond
  // millisecond precision so the JS Date constructor accepts it.
  if (typeof value === "string") {
    const trimmed = value.replace(/(\.\d{3})\d+/, "$1");
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  }
  // Fallback — number (ms since epoch) or anything else Date can parse.
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export function renderStatus(element, message, tone = "info") {
  element.className = `status-message status-${tone}`;
  element.textContent = message;
}

export function renderRecipeList(element, recipes, activeRecipeId) {
  if (!recipes.length) {
    element.innerHTML =
      '<p class="empty-state">No recipes yet — upload your first recipe to get started!</p>';
    return;
  }

  element.innerHTML = recipes
    .map((recipe) => {
      const classes = recipe.id === activeRecipeId ? "recipe-card active" : "recipe-card";

      const photoHtml = recipe.photoURL
        ? `<img src="${escapeHtml(recipe.photoURL)}" alt="" class="recipe-card-photo" />`
        : "";

      return `
        <article class="${classes}">
          <button type="button" data-recipe-id="${escapeHtml(recipe.id)}">
            ${photoHtml}
            <span class="recipe-card-category">${escapeHtml(recipe.category ?? "")}</span>
            <h4>${escapeHtml(recipe.title)}</h4>
            <p>${escapeHtml(recipe.description)}</p>
            <div class="recipe-card-footer">${escapeHtml(recipe.createdBy ?? "")}</div>
          </button>
        </article>
      `;
    })
    .join("");
}

export function renderRecipeDetail(element, detail, currentUserEmail = null) {
  if (!detail) {
    element.innerHTML = '<p class="empty-state">Select a recipe to view details.</p>';
    return;
  }

  const { recipe, ratings } = detail;

  const createdDate = formatCreatedAt(recipe.createdAt);

  const editButton = currentUserEmail
    ? `<button class="btn btn-outline btn-sm" data-edit-recipe="${escapeHtml(recipe.id)}">Edit</button>`
    : "";

  element.innerHTML = `
    <div class="detail-body">
      <div>
        <span class="detail-category">${escapeHtml(recipe.category ?? "")}</span>
        <div class="detail-title-row">
          <h3 class="detail-title">${escapeHtml(recipe.title)}</h3>
          ${editButton}
        </div>
        <p class="detail-description">${escapeHtml(recipe.description)}</p>
      </div>

      <div class="detail-stats">
        <div class="stat">
          <strong>Author</strong>
          <span>${escapeHtml(recipe.createdBy ?? "—")}</span>
        </div>
        <div class="stat">
          <strong>Created</strong>
          <span>${createdDate}</span>
        </div>
        <div class="stat">
          <strong>Prep Time</strong>
          <span>${recipe.prepTime ?? "—"} min</span>
        </div>
      </div>

      ${
        (recipe.ingredients ?? []).length
          ? `<section class="detail-section">
              <h4>Ingredients</h4>
              <ul class="ingredient-list">
                ${recipe.ingredients.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
              </ul>
            </section>`
          : ""
      }

      ${
        recipe.instructions
          ? `<section class="detail-section">
              <h4>Instructions</h4>
              <p class="detail-instructions">${escapeHtml(recipe.instructions)}</p>
            </section>`
          : ""
      }

      <section class="detail-section">
        <div class="rating-header">
          <h4>Ratings</h4>
          <span class="rating-badge">${
            ratings.length
              ? (ratings.reduce((s, r) => s + Number(r.rating ?? 0), 0) / ratings.length).toFixed(1)
              : "0.0"
          } avg / ${ratings.length} total</span>
        </div>
        <div class="rating-list">
          ${
            ratings.length
              ? ratings
                  .map(
                    (rating) => `
                      <article class="rating-card">
                        <div class="rating-header">
                          <h4>${escapeHtml(rating.author ?? "Anonymous")}</h4>
                          <span class="rating-badge">${Number(rating.rating ?? 0)}/5</span>
                        </div>
                        <p>${escapeHtml(rating.comment ?? "")}</p>
                      </article>
                    `
                  )
                  .join("")
              : '<p class="empty-state">No ratings yet for this recipe.</p>'
          }
        </div>
      </section>
    </div>
  `;
}

export function renderAuthState(elements, user) {
  if (!user) {
    elements.authSection.hidden = false;
    elements.authSignedOut.hidden = false;
    elements.authSignedIn.hidden = true;
    elements.authPopup.hidden = true;
    return;
  }

  elements.authSection.hidden = false;
  elements.authSignedOut.hidden = true;
  elements.authSignedIn.hidden = false;
  elements.authPopup.hidden = true;
  elements.authUserEmail.textContent = user.email ?? "Signed in";
}

