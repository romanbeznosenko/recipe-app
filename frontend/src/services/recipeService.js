/**
 * Service for handling recipe-related API calls
 */

const API_URL = 'http://localhost:8000';

/**
 * Get all public recipes
 * @param {number} skip - Number of recipes to skip (for pagination)
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} - Array of recipe objects
 */
export const getAllRecipes = async (skip = 0, limit = 100) => {
    try {
        const response = await fetch(`${API_URL}/recipes/?skip=${skip}&limit=${limit}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching recipes:", error);
        throw error;
    }
};

/**
 * Get a specific recipe by ID
 * @param {number} recipeId - ID of the recipe to fetch
 * @returns {Promise<Object>} - Recipe object
 */
export const getRecipeById = async (recipeId) => {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * Get recipes created by a specific user
 * @param {number} userId - ID of the user
 * @param {number} skip - Number of recipes to skip (for pagination)
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} - Array of recipe objects
 */
export const getUserRecipes = async (userId, skip = 0, limit = 100) => {
    try {
        const response = await fetch(`${API_URL}/recipes/user/${userId}?skip=${skip}&limit=${limit}`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching recipes for user ${userId}:`, error);
        throw error;
    }
};

/**
 * Get recipes created by the currently authenticated user
 * @param {string} token - JWT authentication token
 * @param {number} skip - Number of recipes to skip (for pagination)
 * @param {number} limit - Maximum number of recipes to return
 * @returns {Promise<Array>} - Array of recipe objects
 */
export const getCurrentUserRecipes = async (token, skip = 0, limit = 100) => {
    try {
        const response = await fetch(`${API_URL}/recipes/current/?skip=${skip}&limit=${limit}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching current user recipes:", error);
        throw error;
    }
};

/**
 * Create a new recipe
 * @param {string} token - JWT authentication token
 * @param {Object} recipeData - Recipe data object
 * @returns {Promise<Object>} - Created recipe object
 */
export const createRecipe = async (token, recipeData) => {
    try {
        const response = await fetch(`${API_URL}/recipes/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipeData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating recipe:", error);
        throw error;
    }
};

/**
 * Update an existing recipe
 * @param {string} token - JWT authentication token
 * @param {number} recipeId - ID of the recipe to update
 * @param {Object} recipeData - Updated recipe data
 * @returns {Promise<Object>} - Updated recipe object
 */
export const updateRecipe = async (token, recipeId, recipeData) => {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipeData),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error updating recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * Delete a recipe
 * @param {string} token - JWT authentication token
 * @param {number} recipeId - ID of the recipe to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteRecipe = async (token, recipeId) => {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error(`Error deleting recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * Mock data to use as fallback if API calls fail during development
 */
export const mockRecipes = [
    {
        id: 1,
        title: "Spaghetti Carbonara",
        description: "A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
        preparation_time: 15,
        cooking_time: 20,
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJvP83iYwVnFr75SD5g0NQGairdAuyg0BWvQ&s"
    },
    {
        id: 2,
        title: "Chicken Alfredo",
        description: "A creamy pasta dish with grilled chicken and a rich Alfredo sauce.",
        preparation_time: 10,
        cooking_time: 25,
    },
    {
        id: 3,
        title: "Caesar Salad",
        description: "A fresh salad with romaine, croutons, Parmesan, and Caesar dressing.",
        preparation_time: 5,
        cooking_time: 0,
    },
];

export default {
    getAllRecipes,
    getRecipeById,
    getUserRecipes,
    getCurrentUserRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    mockRecipes
};