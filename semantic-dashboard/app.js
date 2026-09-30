import { fetchProducts, fetchCategories } from "./api.js";

// ======================================================
// AUTHENTICATION
// ======================================================

const loggedInUser = JSON.parse(
    localStorage.getItem("productFlowUser") || "null"
);

if (!loggedInUser) {
    window.location.href = "login.html";
}

// ======================================================
// STORAGE
// ======================================================

const PRODUCTS_KEY = "productFlowProducts";
const CACHE_TIME_KEY = "productFlowCacheTime";
const CART_KEY = "productFlowCart";

const CACHE_DURATION = 10 * 60 * 1000;

// ======================================================
// DOM
// ======================================================

const productContainer = document.getElementById("product-container");
const productSearch = document.getElementById("product-search");
const sortProducts = document.getElementById("sort-products");
const categoryTabs = document.getElementById("category-tabs");

const loadingMessage = document.getElementById("loading-message");
const errorBanner = document.getElementById("error-banner");

const totalProducts = document.getElementById("total-products");
const totalCategories = document.getElementById("total-categories");
const dashboardCartCount =
    document.getElementById("dashboard-cart-count");

const reportProducts = document.getElementById("report-products");
const reportCategories = document.getElementById("report-categories");
const reportCart = document.getElementById("report-cart");

const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartDialog = document.getElementById("cart-dialog");
const closeCartButton =
    document.getElementById("close-cart-button");

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");

const clearCacheButton =
    document.getElementById("clear-cache-button");

// ======================================================
// STATE
// ======================================================

let products = [];
let categories = [];

let cart = JSON.parse(
    localStorage.getItem(CART_KEY) || "[]"
);

let currentSearch = "";
let currentCategory = "all";
let currentSort = "default";

// ======================================================
// UTILITY
// ======================================================

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(price) {
    return `$${Number(price || 0).toFixed(2)}`;
}

function saveProducts() {
    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );

    localStorage.setItem(
        CACHE_TIME_KEY,
        Date.now().toString()
    );
}

function saveCart() {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}

// ======================================================
// FORCE PRODUCT GRID
// ======================================================

function forceProductGrid() {

    let style = document.getElementById(
        "product-grid-force-style"
    );

    if (style) return;

    style = document.createElement("style");

    style.id = "product-grid-force-style";

    style.textContent = `

        /* =========================================
           PRODUCT GRID
        ========================================= */

        #product-container {
            display: grid !important;

            grid-template-columns:
                repeat(3, minmax(0, 1fr)) !important;

            gap: 24px !important;

            width: 100% !important;

            max-width: 100% !important;

            margin: 0 !important;

            padding: 0 !important;

            align-items: stretch !important;

            justify-items: stretch !important;

            box-sizing: border-box !important;
        }


        /* =========================================
           PRODUCT CARD
        ========================================= */

        #product-container > .product-card {

            display: flex !important;

            flex-direction: column !important;

            position: relative !important;

            width: 100% !important;

            min-width: 0 !important;

            max-width: none !important;

            margin: 0 !important;

            padding: 0 !important;

            float: none !important;

            clear: none !important;

            grid-column: auto !important;

            grid-row: auto !important;

            box-sizing: border-box !important;
        }


        /* =========================================
           IMAGE
        ========================================= */

        #product-container
        > .product-card
        .product-image-wrapper {

            width: 100% !important;

            height: 230px !important;

            display: flex !important;

            align-items: center !important;

            justify-content: center !important;

            overflow: hidden !important;

            box-sizing: border-box !important;
        }


        #product-container
        > .product-card
        .product-image {

            max-width: 80% !important;

            max-height: 200px !important;

            width: auto !important;

            height: auto !important;

            object-fit: contain !important;
        }


        /* =========================================
           PRODUCT INFO
        ========================================= */

        #product-container
        > .product-card
        .product-info {

            display: flex !important;

            flex-direction: column !important;

            flex: 1 !important;

            min-width: 0 !important;

            box-sizing: border-box !important;
        }


        #product-container
        > .product-card
        .product-title {

            overflow-wrap: anywhere !important;

            word-break: normal !important;
        }


        #product-container
        > .product-card
        .product-description {

            overflow-wrap: anywhere !important;
        }


        /* =========================================
           PRODUCT ACTIONS
        ========================================= */

        #product-container
        > .product-card
        .product-actions {

            margin-top: auto !important;

            display: flex !important;

            flex-wrap: wrap !important;

            gap: 8px !important;
        }


        /* =========================================
           EMPTY STATE
        ========================================= */

        #product-container > .empty-state {

            grid-column: 1 / -1 !important;

            width: 100% !important;
        }


        /* =========================================
           LARGE SCREEN
        ========================================= */

        @media (min-width: 1400px) {

            #product-container {

                grid-template-columns:
                    repeat(4, minmax(0, 1fr)) !important;

            }

        }


        /* =========================================
           TABLET / LAPTOP
        ========================================= */

        @media (max-width: 1100px) {

            #product-container {

                grid-template-columns:
                    repeat(2, minmax(0, 1fr)) !important;

            }

        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 700px) {

            #product-container {

                grid-template-columns:
                    1fr !important;

                gap: 18px !important;

            }

        }

    `;

    document.head.appendChild(style);
}

// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

    try {

        loadingMessage.hidden = false;
        errorBanner.hidden = true;

        const cachedProducts =
            localStorage.getItem(PRODUCTS_KEY);

        const cachedTime = Number(
            localStorage.getItem(CACHE_TIME_KEY) || 0
        );

        const cacheIsValid =
            cachedProducts &&
            Date.now() - cachedTime < CACHE_DURATION;

        if (cacheIsValid) {

            products = JSON.parse(cachedProducts);

        } else {

            products = await fetchProducts();

            saveProducts();

        }

        renderAll();

    } catch (error) {

        console.error(error);

        errorBanner.textContent =
            "Unable to load products. Please try again.";

        errorBanner.hidden = false;

    } finally {

        loadingMessage.hidden = true;

    }
}

// ======================================================
// LOAD CATEGORIES
// ======================================================

async function loadCategories() {

    try {

        if (products.length > 0) {

            categories = [
                ...new Set(
                    products
                        .map(product => product.category)
                        .filter(Boolean)
                )
            ].sort();

        } else {

            categories = await fetchCategories();

        }

        renderCategories();

    } catch (error) {

        console.error(
            "Unable to load categories:",
            error
        );

    }
}

// ======================================================
// CATEGORIES
// ======================================================

function renderCategories() {

    if (!categoryTabs) return;

    categoryTabs.innerHTML = `

        <button
            type="button"
            class="category-tab ${
                currentCategory === "all"
                    ? "active"
                    : ""
            }"
            data-category="all"
        >
            All
        </button>

        ${categories
            .map(
                category => `
                    <button
                        type="button"
                        class="category-tab ${
                            currentCategory === category
                                ? "active"
                                : ""
                        }"
                        data-category="${escapeHTML(
                            category
                        )}"
                    >
                        ${escapeHTML(category)}
                    </button>
                `
            )
            .join("")}

    `;

    categoryTabs
        .querySelectorAll(".category-tab")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentCategory =
                        button.dataset.category;

                    renderAll();

                }
            );

        });
}

// ======================================================
// FILTER + SORT
// ======================================================

function getFilteredProducts() {

    let result = [...products];

    // Search
    if (currentSearch.trim()) {

        const search =
            currentSearch
                .trim()
                .toLowerCase();

        result = result.filter(product => {

            return (

                product.title
                    ?.toLowerCase()
                    .includes(search)

                ||

                product.category
                    ?.toLowerCase()
                    .includes(search)

                ||

                product.description
                    ?.toLowerCase()
                    .includes(search)

            );

        });

    }

    // Category
    if (currentCategory !== "all") {

        result = result.filter(
            product =>
                product.category ===
                currentCategory
        );

    }

    // Sort
    if (currentSort === "price-low") {

        result.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }

    if (currentSort === "price-high") {

        result.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }

    if (currentSort === "title") {

        result.sort(
            (a, b) =>
                String(a.title).localeCompare(
                    String(b.title)
                )
        );

    }

    return result;
}

// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts() {

    // Force grid every time products render
    forceProductGrid();

    if (!productContainer) return;

    const filteredProducts =
        getFilteredProducts();

    if (filteredProducts.length === 0) {

        productContainer.innerHTML = `

            <div class="empty-state">

                <h3>No products found</h3>

                <p>
                    Try changing your search
                    or category filter.
                </p>

            </div>

        `;

        return;
    }

    /*
       IMPORTANT:

       Every product-card is directly inside
       #product-container.

       There is NO extra row/container.
    */

    productContainer.innerHTML =
        filteredProducts
            .map(product => {

                const alreadyInCart =
                    cart.some(
                        item =>
                            String(item.id) ===
                            String(product.id)
                    );

                return `

                    <article
                        class="product-card"
                    >

                        <div
                            class="product-image-wrapper"
                        >

                            <img
                                src="${escapeHTML(
                                    product.image
                                )}"
                                alt="${escapeHTML(
                                    product.title
                                )}"
                                class="product-image"
                                loading="lazy"
                            />

                        </div>


                        <div
                            class="product-info"
                        >

                            <div
                                class="product-category"
                            >
                                ${escapeHTML(
                                    product.category
                                )}
                            </div>


                            <h3
                                class="product-title"
                            >
                                ${escapeHTML(
                                    product.title
                                )}
                            </h3>


                            <p
                                class="product-description"
                            >
                                ${escapeHTML(
                                    product.description
                                )}
                            </p>


                            <div
                                class="product-price"
                            >
                                ${formatPrice(
                                    product.price
                                )}
                            </div>


                            <div
                                class="product-actions"
                            >

                                <button
                                    type="button"
                                    class="primary-button add-cart-button"
                                    data-id="${escapeHTML(
                                        product.id
                                    )}"
                                >
                                    ${
                                        alreadyInCart
                                            ? "In Cart"
                                            : "Add to Cart"
                                    }
                                </button>


                                <button
                                    type="button"
                                    class="secondary-button edit-product-button"
                                    data-id="${escapeHTML(
                                        product.id
                                    )}"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="danger-button delete-product-button"
                                    data-id="${escapeHTML(
                                        product.id
                                    )}"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    </article>

                `;

            })
            .join("");

    attachProductEvents();
}

// ======================================================
// PRODUCT EVENTS
// ======================================================

function attachProductEvents() {

    productContainer
        .querySelectorAll(".add-cart-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    addToCart(
                        button.dataset.id
                    );

                }
            );

        });


    productContainer
        .querySelectorAll(".edit-product-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openProductForm(
                        button.dataset.id
                    );

                }
            );

        });


    productContainer
        .querySelectorAll(".delete-product-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deleteProduct(
                        button.dataset.id
                    );

                }
            );

        });

}

// ======================================================
// CART - ADD
// ======================================================

function addToCart(productId) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) return;

    const existing =
        cart.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,

            title: product.title,

            price: Number(product.price),

            image: product.image,

            quantity: 1

        });

    }

    saveCart();

    renderAll();
}

// ======================================================
// CART - QUANTITY
// ======================================================

function updateCartQuantity(
    productId,
    change
) {

    const item =
        cart.find(
            cartItem =>
                String(cartItem.id) ===
                String(productId)
        );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {

        cart =
            cart.filter(
                cartItem =>
                    String(cartItem.id) !==
                    String(productId)
            );

    }

    saveCart();

    renderAll();
}

// ======================================================
// CART - REMOVE
// ======================================================

function removeFromCart(productId) {

    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(productId)
        );

    saveCart();

    renderAll();
}

// ======================================================
// RENDER CART
// ======================================================

function renderCart() {

    const itemCount =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );

    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                item.quantity,
            0
        );

    if (cartCount) {
        cartCount.textContent = itemCount;
    }

    if (dashboardCartCount) {
        dashboardCartCount.textContent =
            itemCount;
    }

    if (reportCart) {
        reportCart.textContent =
            itemCount;
    }

    if (cartTotal) {
        cartTotal.textContent =
            formatPrice(total);
    }

    if (!cartItems) return;

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <p>
                    Your cart is empty.
                </p>

            </div>

        `;

        return;
    }

    cartItems.innerHTML =
        cart
            .map(
                item => `

                    <div
                        class="cart-item"
                    >

                        <img
                            src="${escapeHTML(
                                item.image
                            )}"
                            alt="${escapeHTML(
                                item.title
                            )}"
                        />

                        <div
                            class="cart-item-info"
                        >

                            <h4>
                                ${escapeHTML(
                                    item.title
                                )}
                            </h4>

                            <p>
                                ${formatPrice(
                                    item.price
                                )}
                            </p>


                            <div
                                class="cart-item-controls"
                            >

                                <button
                                    type="button"
                                    class="cart-quantity-button"
                                    data-action="decrease"
                                    data-id="${escapeHTML(
                                        item.id
                                    )}"
                                >
                                    −
                                </button>


                                <span>
                                    ${item.quantity}
                                </span>


                                <button
                                    type="button"
                                    class="cart-quantity-button"
                                    data-action="increase"
                                    data-id="${escapeHTML(
                                        item.id
                                    )}"
                                >
                                    +
                                </button>


                                <button
                                    type="button"
                                    class="cart-remove-button"
                                    data-id="${escapeHTML(
                                        item.id
                                    )}"
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    </div>

                `
            )
            .join("");


    cartItems
        .querySelectorAll(
            ".cart-quantity-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const change =
                        button.dataset.action ===
                        "increase"
                            ? 1
                            : -1;

                    updateCartQuantity(
                        button.dataset.id,
                        change
                    );

                }
            );

        });


    cartItems
        .querySelectorAll(
            ".cart-remove-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        button.dataset.id
                    );

                }
            );

        });
}

// ======================================================
// STATS
// ======================================================

function renderStats() {

    if (totalProducts) {

        totalProducts.textContent =
            products.length;

    }

    if (totalCategories) {

        totalCategories.textContent =
            categories.length;

    }

    if (reportProducts) {

        reportProducts.textContent =
            products.length;

    }

    if (reportCategories) {

        reportCategories.textContent =
            categories.length;

    }
}

// ======================================================
// ADD PRODUCT BUTTON
// ======================================================

function createAddProductButton() {

    const heading =
        document.querySelector(
            ".product-section-heading"
        );

    if (!heading) return;

    if (
        document.getElementById(
            "add-product-button"
        )
    ) {
        return;
    }

    const button =
        document.createElement("button");

    button.id =
        "add-product-button";

    button.type = "button";

    button.className =
        "primary-button";

    button.textContent =
        "+ Add Product";

    button.addEventListener(
        "click",
        () => {
            openProductForm();
        }
    );

    heading.appendChild(button);
}

// ======================================================
// PRODUCT FORM
// ======================================================

function createProductFormDialog() {

    if (
        document.getElementById(
            "product-form-dialog"
        )
    ) {
        return;
    }

    const dialog =
        document.createElement("dialog");

    dialog.id =
        "product-form-dialog";

    dialog.innerHTML = `

        <form
            method="dialog"
            class="product-form"
            id="product-form"
        >

            <div
                class="modal-header"
            >

                <h2
                    id="product-form-title"
                >
                    Add Product
                </h2>

                <button
                    type="button"
                    class="modal-close"
                    id="close-product-form"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <input
                type="hidden"
                id="product-form-id"
            />


            <label
                for="product-form-name"
            >
                Product Name
            </label>

            <input
                id="product-form-name"
                type="text"
                required
            />


            <label
                for="product-form-description"
            >
                Description
            </label>

            <textarea
                id="product-form-description"
                rows="4"
                required
            ></textarea>


            <label
                for="product-form-price"
            >
                Price
            </label>

            <input
                id="product-form-price"
                type="number"
                min="0"
                step="0.01"
                required
            />


            <label
                for="product-form-category"
            >
                Category
            </label>

            <input
                id="product-form-category"
                type="text"
                required
            />


            <label
                for="product-form-image"
            >
                Image URL
            </label>

            <input
                id="product-form-image"
                type="url"
                required
            />


            <div
                class="form-actions"
            >

                <button
                    type="button"
                    class="secondary-button"
                    id="cancel-product-form"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    class="primary-button"
                >
                    Save Product
                </button>

            </div>

        </form>

    `;

    document.body.appendChild(dialog);


    document
        .getElementById(
            "close-product-form"
        )
        .addEventListener(
            "click",
            () => {
                dialog.close();
            }
        );


    document
        .getElementById(
            "cancel-product-form"
        )
        .addEventListener(
            "click",
            () => {
                dialog.close();
            }
        );


    document
        .getElementById(
            "product-form"
        )
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveProduct();

            }
        );
}

// ======================================================
// OPEN FORM
// ======================================================

function openProductForm(
    productId = null
) {

    createProductFormDialog();

    const dialog =
        document.getElementById(
            "product-form-dialog"
        );

    const title =
        document.getElementById(
            "product-form-title"
        );

    const id =
        document.getElementById(
            "product-form-id"
        );

    const name =
        document.getElementById(
            "product-form-name"
        );

    const description =
        document.getElementById(
            "product-form-description"
        );

    const price =
        document.getElementById(
            "product-form-price"
        );

    const category =
        document.getElementById(
            "product-form-category"
        );

    const image =
        document.getElementById(
            "product-form-image"
        );


    if (productId) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );

        if (!product) return;

        title.textContent =
            "Edit Product";

        id.value =
            product.id;

        name.value =
            product.title;

        description.value =
            product.description;

        price.value =
            product.price;

        category.value =
            product.category;

        image.value =
            product.image;

    } else {

        title.textContent =
            "Add Product";

        id.value = "";

        name.value = "";

        description.value = "";

        price.value = "";

        category.value = "";

        image.value = "";

    }

    dialog.showModal();
}

// ======================================================
// SAVE PRODUCT
// ======================================================

function saveProduct() {

    const id =
        document.getElementById(
            "product-form-id"
        ).value;

    const title =
        document
            .getElementById(
                "product-form-name"
            )
            .value
            .trim();

    const description =
        document
            .getElementById(
                "product-form-description"
            )
            .value
            .trim();

    const price =
        Number(
            document.getElementById(
                "product-form-price"
            ).value
        );

    const category =
        document
            .getElementById(
                "product-form-category"
            )
            .value
            .trim();

    const image =
        document
            .getElementById(
                "product-form-image"
            )
            .value
            .trim();


    if (
        !title ||
        !description ||
        !category ||
        !image
    ) {
        return;
    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {
        return;
    }


    if (id) {

        const index =
            products.findIndex(
                product =>
                    String(product.id) ===
                    String(id)
            );

        if (index !== -1) {

            products[index] = {

                ...products[index],

                title,

                description,

                price,

                category,

                image

            };

        }

    } else {

        products.unshift({

            id:
                `local-${Date.now()}`,

            title,

            description,

            price,

            category,

            image,

            rating: {

                rate: 0,

                count: 0

            }

        });

    }


    saveProducts();


    categories = [
        ...new Set(
            products
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)
        )
    ].sort();


    document
        .getElementById(
            "product-form-dialog"
        )
        .close();


    renderAll();
}

// ======================================================
// DELETE PRODUCT
// ======================================================

function deleteProduct(productId) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) return;


    const confirmed =
        window.confirm(
            `Remove "${product.title}" from the catalog?`
        );


    if (!confirmed) return;


    products =
        products.filter(
            item =>
                String(item.id) !==
                String(productId)
        );


    cart =
        cart.filter(
            item =>
                String(item.id) !==
                String(productId)
        );


    saveProducts();

    saveCart();


    categories = [
        ...new Set(
            products
                .map(
                    product =>
                        product.category
                )
                .filter(Boolean)
        )
    ].sort();


    if (
        currentCategory !== "all" &&
        !categories.includes(
            currentCategory
        )
    ) {

        currentCategory = "all";

    }


    renderAll();
}

// ======================================================
// USER
// ======================================================

function renderUserName() {

    const userName =
        document.getElementById(
            "user-name"
        );

    if (!userName) return;

    userName.textContent =
        loggedInUser?.name ||
        loggedInUser?.email ||
        "User";
}

// ======================================================
// LOGOUT
// ======================================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logout-button"
        );

    if (!logoutButton) return;


    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "productFlowUser"
            );

            window.location.href =
                "login.html";

        }
    );
}

// ======================================================
// SEARCH
// ======================================================

function setupSearch() {

    if (!productSearch) return;


    productSearch.addEventListener(
        "input",
        event => {

            currentSearch =
                event.target.value;

            renderProducts();

        }
    );
}

// ======================================================
// SORT
// ======================================================

function setupSort() {

    if (!sortProducts) return;


    sortProducts.addEventListener(
        "change",
        event => {

            currentSort =
                event.target.value;

            renderProducts();

        }
    );
}

// ======================================================
// CART DIALOG
// ======================================================

function setupCartDialog() {

    if (
        cartButton &&
        cartDialog
    ) {

        cartButton.addEventListener(
            "click",
            () => {

                renderCart();

                cartDialog.showModal();

            }
        );

    }


    if (
        closeCartButton &&
        cartDialog
    ) {

        closeCartButton.addEventListener(
            "click",
            () => {

                cartDialog.close();

            }
        );

    }
}

// ======================================================
// CLEAR CACHE
// ======================================================

function setupClearCache() {

    if (!clearCacheButton) return;


    clearCacheButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                PRODUCTS_KEY
            );

            localStorage.removeItem(
                CACHE_TIME_KEY
            );

            window.location.reload();

        }
    );
}

// ======================================================
// ESCAPE
// ======================================================

function setupEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            const dialog =
                document.getElementById(
                    "product-form-dialog"
                );

            if (
                dialog &&
                dialog.open
            ) {

                dialog.close();

            }

        }
    );
}

// ======================================================
// RENDER ALL
// ======================================================

function renderAll() {

    forceProductGrid();

    renderStats();

    renderCategories();

    renderProducts();

    renderCart();
}

// ======================================================
// INITIALIZE
// ======================================================

async function initialize() {

    // FORCE GRID FIRST
    forceProductGrid();

    createAddProductButton();

    createProductFormDialog();

    renderUserName();

    setupLogout();

    setupSearch();

    setupSort();

    setupCartDialog();

    setupClearCache();

    setupEscapeKey();

    await loadProducts();

    await loadCategories();

    renderAll();
}

// ======================================================
// START
// ======================================================

initialize();