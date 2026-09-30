import { fetchProducts, fetchCategories } from "./api.js";

// =========================================================
// CLIENT STATE
// =========================================================

const state = {
    products: [],
    categories: [],
    searchTerm: "",
    selectedCategory: "all",
    sortBy: "default",
    loading: true,
    error: null
};

const CACHE_KEY = "semanticDashboardProducts";
const CACHE_TIME_KEY = "semanticDashboardCacheTime";
const CACHE_DURATION = 10 * 60 * 1000;


// =========================================================
// DOM ELEMENTS
// =========================================================

const productContainer =
    document.getElementById("product-container");

const searchInput =
    document.getElementById("product-search");

const categoryContainer =
    document.getElementById("category-tabs");

const sortSelect =
    document.getElementById("sort-products");

const loadingMessage =
    document.getElementById("loading-message");

const errorBanner =
    document.getElementById("error-banner");


// =========================================================
// LOCAL STORAGE CACHE
// =========================================================

function getCachedProducts() {

    const cachedProducts =
        localStorage.getItem(CACHE_KEY);

    const cachedTime =
        localStorage.getItem(CACHE_TIME_KEY);

    if (!cachedProducts || !cachedTime) {
        return null;
    }

    const cacheAge =
        Date.now() - Number(cachedTime);

    if (cacheAge > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);

        return null;
    }

    try {
        return JSON.parse(cachedProducts);
    } catch (error) {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIME_KEY);

        return null;
    }
}


function saveProductsToCache(products) {

    localStorage.setItem(
        CACHE_KEY,
        JSON.stringify(products)
    );

    localStorage.setItem(
        CACHE_TIME_KEY,
        Date.now().toString()
    );
}


// =========================================================
// LOADING STATE
// =========================================================

function showLoading() {

    loadingMessage.hidden = false;

    productContainer.innerHTML = "";

    for (let i = 0; i < 6; i++) {

        const skeleton =
            document.createElement("article");

        skeleton.className = "product-skeleton";

        skeleton.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
            <div class="skeleton-line"></div>
        `;

        productContainer.appendChild(skeleton);
    }
}


function hideLoading() {
    loadingMessage.hidden = true;
}


// =========================================================
// ERROR BANNER
// =========================================================

function showError(message) {

    errorBanner.textContent = message;
    errorBanner.hidden = false;
}


function hideError() {

    errorBanner.textContent = "";
    errorBanner.hidden = true;
}


// =========================================================
// FETCH DATA
// =========================================================

async function loadProducts() {

    showLoading();
    hideError();

    try {

        const cachedProducts =
            getCachedProducts();

        if (cachedProducts) {

            state.products = cachedProducts;

        } else {

            state.products =
                await fetchProducts();

            saveProductsToCache(
                state.products
            );
        }

        state.categories =
            await fetchCategories();

        state.loading = false;

        renderCategories();
        renderProducts();

    } catch (error) {

        state.loading = false;
        state.error = error.message;

        showError(
            "We couldn't load the products right now. Please try again."
        );

        productContainer.innerHTML = `
            <article class="empty-state">
                <h2>Unable to load products</h2>
                <p>
                    Please check your internet connection
                    and try again.
                </p>
                <button
                    type="button"
                    id="retry-button"
                >
                    Try Again
                </button>
            </article>
        `;

        document
            .getElementById("retry-button")
            .addEventListener(
                "click",
                loadProducts
            );

    } finally {

        hideLoading();
    }
}


// =========================================================
// CATEGORY TABS
// =========================================================

function renderCategories() {

    categoryContainer.innerHTML = "";

    const allButton =
        document.createElement("button");

    allButton.type = "button";
    allButton.className =
        state.selectedCategory === "all"
            ? "category-button active"
            : "category-button";

    allButton.textContent = "All";

    allButton.addEventListener(
        "click",
        () => {

            state.selectedCategory = "all";

            renderCategories();
            renderProducts();
        }
    );

    categoryContainer.appendChild(allButton);


    state.categories.forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            state.selectedCategory === category
                ? "category-button active"
                : "category-button";

        button.textContent = category;

        button.addEventListener(
            "click",
            () => {

                state.selectedCategory =
                    category;

                renderCategories();
                renderProducts();
            }
        );

        categoryContainer.appendChild(button);
    });
}


// =========================================================
// FILTER + SORT
// =========================================================

function getFilteredProducts() {

    let filtered =
        [...state.products];


    // Search filtering
    if (state.searchTerm.trim()) {

        const search =
            state.searchTerm
                .toLowerCase()
                .trim();

        filtered =
            filtered.filter(product =>
                product.title
                    .toLowerCase()
                    .includes(search)
            );
    }


    // Category filtering
    if (state.selectedCategory !== "all") {

        filtered =
            filtered.filter(product =>
                product.category ===
                state.selectedCategory
            );
    }


    // Sorting
    if (state.sortBy === "price-low") {

        filtered.sort(
            (a, b) => a.price - b.price
        );

    } else if (state.sortBy === "price-high") {

        filtered.sort(
            (a, b) => b.price - a.price
        );

    } else if (state.sortBy === "name") {

        filtered.sort(
            (a, b) =>
                a.title.localeCompare(b.title)
        );
    }


    return filtered;
}


// =========================================================
// RENDER PRODUCTS
// =========================================================

function renderProducts() {

    const products =
        getFilteredProducts();

    productContainer.innerHTML = "";


    if (products.length === 0) {

        productContainer.innerHTML = `
            <article class="empty-state">
                <h2>No products found</h2>
                <p>
                    Try another search term or category.
                </p>
            </article>
        `;

        return;
    }


    products.forEach(product => {

        const article =
            document.createElement("article");

        article.className =
            "product-card";

        article.innerHTML = `
            <div class="product-image-wrapper">
                <img
                    src="${product.image}"
                    alt="${product.title}"
                    loading="lazy"
                >
            </div>

            <div class="product-content">

                <p class="product-category">
                    ${product.category}
                </p>

                <h3>
                    ${product.title}
                </h3>

                <p class="product-price">
                    $${product.price.toFixed(2)}
                </p>

                <p class="product-rating">
                    Rating:
                    ${product.rating?.rate ?? "N/A"}
                    / 5
                </p>

            </div>
        `;

        productContainer.appendChild(article);
    });
}


// =========================================================
// EVENT LISTENERS
// =========================================================

searchInput.addEventListener(
    "input",
    event => {

        state.searchTerm =
            event.target.value;

        renderProducts();
    }
);


sortSelect.addEventListener(
    "change",
    event => {

        state.sortBy =
            event.target.value;

        renderProducts();
    }
);


// =========================================================
// INITIALIZE APPLICATION
// =========================================================

loadProducts();