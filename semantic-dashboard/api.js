const API_BASE_URL = "https://fakestoreapi.com";


// =========================================================
// FETCH PRODUCTS
// =========================================================

export async function fetchProducts() {

    const response =
        await fetch(
            `${API_BASE_URL}/products`
        );


    if (!response.ok) {

        throw new Error(
            "Unable to fetch products."
        );
    }


    return await response.json();
}


// =========================================================
// FETCH CATEGORIES
// =========================================================

export async function fetchCategories() {

    const response =
        await fetch(
            `${API_BASE_URL}/products/categories`
        );


    if (!response.ok) {

        throw new Error(
            "Unable to fetch categories."
        );
    }


    return await response.json();
}