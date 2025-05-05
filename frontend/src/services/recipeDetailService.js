/**
 * Service for handling recipe detail API calls
 */

const API_URL = 'http://localhost:8000';

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
 * Get ingredients for a specific recipe
 * @param {number} recipeId - ID of the recipe
 * @returns {Promise<Array>} - Array of ingredient objects
 */
export const getRecipeIngredients = async (recipeId) => {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}/ingredients`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching ingredients for recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * Get steps for a specific recipe
 * @param {number} recipeId - ID of the recipe
 * @returns {Promise<Array>} - Array of step objects
 */
export const getRecipeSteps = async (recipeId) => {
    try {
        const response = await fetch(`${API_URL}/recipes/${recipeId}/steps`, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching steps for recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * Get complete recipe data including ingredients and steps
 * @param {number} recipeId - ID of the recipe
 * @returns {Promise<Object>} - Complete recipe object with ingredients and steps
 */
export const getCompleteRecipe = async (recipeId) => {
    try {
        // Fetch the recipe data, ingredients, and steps in parallel
        const [recipe, ingredients, steps] = await Promise.all([
            getRecipeById(recipeId),
            getRecipeIngredients(recipeId),
            getRecipeSteps(recipeId)
        ]);

        // Format steps to match Step component requirements
        const formattedSteps = steps.map(step => ({
            stepNumber: `Step ${step.order_number}`,
            description: step.description,
            temperature: step.temperature.toString(),
            speed: step.speed.toString(),
            duration: step.duration.toString()
        }));

        // Format ingredients
        const formattedIngredients = ingredients.map(ingredient => 
            `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
        );

        // Combine all data
        return {
            ...recipe,
            ingredients: formattedIngredients,
            steps: formattedSteps,
            // Default image if none provided
            imgUrl: recipe.image_url || "https://via.placeholder.com/400x300?text=No+Image"
        };
    } catch (error) {
        console.error(`Error fetching complete recipe ${recipeId}:`, error);
        throw error;
    }
};

/**
 * Mock data to use as fallback if API calls fail during development
 */
export const getMockRecipe = (recipeId) => {
    return {
        id: parseInt(recipeId),
        title: `Recipe #${recipeId}`,
        imgUrl: "https://www.forksoverknives.com/uploads/lemon-hummus-pasta-wordpress.jpg?auto=webp",
        description: "Hummus, with its nutty and garlicky flavor, makes a fantastic dip, spread or even a salad dressing, but it can also be a great base for a pasta sauce. A little garlic and shallot sizzled in olive oil, along with fresh lemon juice and zest, help amp up premade hummus.",
        yield: "4 servings",
        preparation_time: 15,
        cooking_time: 20,
        servings: 4,
        ingredients: [
            "Salt",
            "12 ounces spaghetti",
            "1/4 cup olive oil"
        ],
        steps: [
            {
                stepNumber: "Step 1",
                description: "Pour 2 liters of water into the DreamFoodX bowl, add salt, bring to a boil. Add the pasta and cook until tender. Drain, reserving 1 cup of pasta water.",
                temperature: "100",
                speed: "2",
                duration: "10"
            },
            {
                stepNumber: "Step 2",
                description: "Heat olive oil in a pan, add garlic and shallots, and sauté until fragrant. Add hummus and thin with pasta water to create the sauce.",
                temperature: "90",
                speed: "1",
                duration: "15"
            },
            {
                stepNumber: "Step 3",
                description: "Combine the cooked pasta with the hummus sauce. Add any desired herbs or veggies and mix well.",
                temperature: "20",
                speed: "0",
                duration: "5"
            }
        ]
    };
};

export default {
    getRecipeById,
    getRecipeIngredients,
    getRecipeSteps,
    getCompleteRecipe,
    getMockRecipe
};