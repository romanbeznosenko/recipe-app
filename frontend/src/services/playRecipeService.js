/**
 * Service for handling Play Recipe API calls and data processing
 */

const API_URL = 'http://localhost:8000';

/**
 * Get complete recipe data optimized for play mode
 * @param {number} recipeId - ID of the recipe
 * @returns {Promise<Object>} - Complete recipe object optimized for step-by-step cooking
 */
export const getRecipeForPlayMode = async (recipeId) => {
    try {
        // Fetch all data in parallel for better performance
        const [recipeResponse, ingredientsResponse, stepsResponse] = await Promise.all([
            fetch(`${API_URL}/recipes/${recipeId}`, {
                headers: { "Content-Type": "application/json" }
            }),
            fetch(`${API_URL}/recipes/${recipeId}/ingredients`, {
                headers: { "Content-Type": "application/json" }
            }),
            fetch(`${API_URL}/recipes/${recipeId}/steps`, {
                headers: { "Content-Type": "application/json" }
            })
        ]);

        if (!recipeResponse.ok) {
            if (recipeResponse.status === 404) {
                throw new Error("Recipe not found");
            }
            throw new Error(`Error fetching recipe: ${recipeResponse.status}`);
        }

        const [recipeData, ingredientsData, stepsData] = await Promise.all([
            recipeResponse.json(),
            ingredientsResponse.ok ? ingredientsResponse.json() : [],
            stepsResponse.ok ? stepsResponse.json() : []
        ]);

        // Sort steps by order
        const sortedSteps = stepsData.sort((a, b) => a.order_number - b.order_number);

        // Process steps for play mode with ingredients distribution
        const processedSteps = distributeIngredientsToSteps(sortedSteps, ingredientsData);

        return {
            id: recipeData.id,
            title: recipeData.title,
            description: recipeData.description,
            servings: recipeData.servings,
            preparation_time: recipeData.preparation_time,
            cooking_time: recipeData.cooking_time,
            is_public: recipeData.is_public,
            user_id: recipeData.user_id,
            steps: processedSteps,
            totalIngredients: ingredientsData.length,
            estimatedTotalTime: recipeData.preparation_time + recipeData.cooking_time
        };

    } catch (error) {
        console.error(`Error fetching recipe ${recipeId} for play mode:`, error);
        throw error;
    }
};

/**
 * Distribute ingredients across recipe steps intelligently
 * @param {Array} steps - Array of step objects
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Array} - Steps with ingredients assigned
 */
const distributeIngredientsToSteps = (steps, ingredients) => {
    if (!steps.length || !ingredients.length) {
        return steps.map(formatStep);
    }

    // Create a map to track which ingredients go with which steps
    const stepIngredients = new Map();

    // Initialize each step with empty ingredients array
    steps.forEach((_, index) => {
        stepIngredients.set(index, []);
    });

    // Strategy 1: Try to match ingredients to steps based on keywords
    const keywordMatching = matchIngredientsByKeywords(steps, ingredients);

    // Strategy 2: Distribute remaining ingredients evenly
    const remainingIngredients = ingredients.filter(ing =>
        !keywordMatching.some(match => match.ingredientId === ing.id)
    );

    // Apply keyword matches
    keywordMatching.forEach(match => {
        const ingredient = ingredients.find(ing => ing.id === match.ingredientId);
        if (ingredient) {
            stepIngredients.get(match.stepIndex).push(ingredient);
        }
    });

    // Distribute remaining ingredients evenly across steps
    remainingIngredients.forEach((ingredient, index) => {
        const stepIndex = index % steps.length;
        stepIngredients.get(stepIndex).push(ingredient);
    });

    // Format steps with their assigned ingredients
    return steps.map((step, index) =>
        formatStep(step, stepIngredients.get(index))
    );
};

/**
 * Match ingredients to steps based on keywords in descriptions
 * @param {Array} steps - Array of step objects
 * @param {Array} ingredients - Array of ingredient objects
 * @returns {Array} - Array of matches {stepIndex, ingredientId}
 */
const matchIngredientsByKeywords = (steps, ingredients) => {
    const matches = [];

    steps.forEach((step, stepIndex) => {
        const stepDescription = step.description.toLowerCase();

        ingredients.forEach(ingredient => {
            const ingredientName = ingredient.name.toLowerCase();

            // Check if ingredient is mentioned in step description
            if (stepDescription.includes(ingredientName)) {
                matches.push({
                    stepIndex,
                    ingredientId: ingredient.id,
                    confidence: 1.0
                });
            }

            // Check for partial matches or cooking-related keywords
            const ingredientWords = ingredientName.split(' ');
            const hasPartialMatch = ingredientWords.some(word =>
                word.length > 3 && stepDescription.includes(word)
            );

            if (hasPartialMatch && !matches.some(m => m.ingredientId === ingredient.id)) {
                matches.push({
                    stepIndex,
                    ingredientId: ingredient.id,
                    confidence: 0.7
                });
            }
        });
    });

    // Sort by confidence and remove duplicates (keep highest confidence)
    const uniqueMatches = [];
    const seenIngredients = new Set();

    matches
        .sort((a, b) => b.confidence - a.confidence)
        .forEach(match => {
            if (!seenIngredients.has(match.ingredientId)) {
                uniqueMatches.push(match);
                seenIngredients.add(match.ingredientId);
            }
        });

    return uniqueMatches;
};

/**
 * Format a step object for play mode
 * @param {Object} step - Raw step object from API
 * @param {Array} ingredients - Ingredients for this step
 * @returns {Object} - Formatted step object
 */
const formatStep = (step, ingredients = []) => {
    return {
        stepNumber: step.order_number,
        description: step.description,
        temperature: step.temperature,
        speed: step.speed,
        duration: step.duration,
        actionType: step.action_type || 'cook',
        ingredients: ingredients.map(ing =>
            `${ing.quantity} ${ing.unit} ${ing.name}`
        ),
        // Add helpful metadata
        hasTimer: step.duration > 0,
        requiresHeat: step.temperature > 25,
        toolsNeeded: extractToolsFromDescription(step.description)
    };
};

/**
 * Extract cooking tools/equipment mentioned in step description
 * @param {string} description - Step description
 * @returns {Array} - Array of tools/equipment
 */
const extractToolsFromDescription = (description) => {
    const tools = [];
    const toolKeywords = [
        'pan', 'pot', 'skillet', 'bowl', 'whisk', 'spoon', 'knife',
        'cutting board', 'mixer', 'blender', 'oven', 'stove', 'microwave',
        'baking sheet', 'measuring cup', 'strainer', 'colander'
    ];

    const lowerDescription = description.toLowerCase();
    toolKeywords.forEach(tool => {
        if (lowerDescription.includes(tool)) {
            tools.push(tool);
        }
    });

    return [...new Set(tools)]; // Remove duplicates
};

/**
 * Get cooking progress statistics
 * @param {number} currentStep - Current step index
 * @param {Array} completedSteps - Set of completed step indices
 * @param {Array} steps - All recipe steps
 * @returns {Object} - Progress statistics
 */
export const getCookingProgress = (currentStep, completedSteps, steps) => {
    const totalSteps = steps.length;
    const completedCount = completedSteps.size;
    const progressPercentage = Math.round(((completedCount + (currentStep < totalSteps ? 1 : 0)) / totalSteps) * 100);

    const remainingTime = steps
        .slice(currentStep)
        .reduce((total, step) => total + (step.duration || 0), 0);

    const totalCookingTime = steps
        .reduce((total, step) => total + (step.duration || 0), 0);

    return {
        currentStep: currentStep + 1,
        totalSteps,
        completedCount,
        progressPercentage,
        remainingSteps: totalSteps - currentStep,
        remainingTime,
        totalCookingTime,
        isComplete: completedCount === totalSteps
    };
};

/**
 * Mock data provider for development/fallback
 * @param {number} recipeId - Recipe ID
 * @returns {Object} - Mock recipe data
 */
export const getMockRecipeForPlayMode = (recipeId) => {
    return {
        id: parseInt(recipeId),
        title: "Spaghetti Carbonara",
        description: "A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
        servings: 4,
        preparation_time: 15,
        cooking_time: 20,
        is_public: true,
        user_id: 1,
        steps: [
            {
                stepNumber: 1,
                description: "Bring a large pot of salted water to boil. Add spaghetti and cook until al dente according to package directions.",
                temperature: 100,
                speed: 2,
                duration: 10,
                actionType: "cook",
                ingredients: ["400g spaghetti", "Salt for pasta water"],
                hasTimer: true,
                requiresHeat: true,
                toolsNeeded: ["pot", "stove"]
            },
            {
                stepNumber: 2,
                description: "While pasta cooks, heat a large skillet over medium heat. Add pancetta and cook until crispy and golden.",
                temperature: 90,
                speed: 1,
                duration: 8,
                actionType: "fry",
                ingredients: ["150g pancetta, diced"],
                hasTimer: true,
                requiresHeat: true,
                toolsNeeded: ["skillet", "stove"]
            },
            {
                stepNumber: 3,
                description: "In a bowl, whisk together eggs, grated cheese, and black pepper until well combined.",
                temperature: 20,
                speed: 0,
                duration: 3,
                actionType: "mix",
                ingredients: ["3 large eggs", "100g Pecorino Romano cheese, grated", "Freshly ground black pepper"],
                hasTimer: true,
                requiresHeat: false,
                toolsNeeded: ["bowl", "whisk"]
            },
            {
                stepNumber: 4,
                description: "Drain pasta, reserving 1 cup of pasta water. Add hot pasta to the skillet with pancetta.",
                temperature: 80,
                speed: 1,
                duration: 2,
                actionType: "mix",
                ingredients: ["Reserved pasta water"],
                hasTimer: true,
                requiresHeat: true,
                toolsNeeded: ["strainer", "skillet"]
            },
            {
                stepNumber: 5,
                description: "Remove skillet from heat. Quickly pour egg mixture over pasta while tossing continuously. Add pasta water gradually until creamy.",
                temperature: 60,
                speed: 2,
                duration: 5,
                actionType: "mix",
                ingredients: ["Egg mixture from step 3"],
                hasTimer: true,
                requiresHeat: false,
                toolsNeeded: ["skillet", "spoon"]
            },
            {
                stepNumber: 6,
                description: "Serve immediately with extra cheese and black pepper. Enjoy your homemade carbonara!",
                temperature: 0,
                speed: 0,
                duration: 1,
                actionType: "serve",
                ingredients: ["Extra Pecorino Romano", "Extra black pepper"],
                hasTimer: false,
                requiresHeat: false,
                toolsNeeded: ["serving plates"]
            }
        ],
        totalIngredients: 6,
        estimatedTotalTime: 35
    };
};

/**
 * Save cooking session data (for future features like cooking history)
 * @param {Object} sessionData - Cooking session data
 * @returns {Promise<boolean>} - Success status
 */
export const saveCookingSession = async (sessionData) => {
    try {
        // This would be implemented when you add cooking history features
        console.log('Cooking session completed:', sessionData);
        return true;
    } catch (error) {
        console.error('Error saving cooking session:', error);
        return false;
    }
};

/**
 * Get cooking tips based on step type and ingredients
 * @param {Object} step - Current step object
 * @returns {Array} - Array of cooking tips
 */
export const getCookingTips = (step) => {
    const tips = [];

    if (step.actionType === 'cook' && step.temperature > 90) {
        tips.push("💡 Keep the heat at medium-high to avoid burning");
    }

    if (step.actionType === 'fry') {
        tips.push("🔥 Let the pan heat up before adding ingredients");
    }

    if (step.actionType === 'mix' && step.ingredients.some(ing => ing.includes('egg'))) {
        tips.push("🥚 Add eggs slowly while stirring to prevent scrambling");
    }

    if (step.duration > 10) {
        tips.push("⏰ This step takes a while - perfect time to prep the next step");
    }

    if (step.requiresHeat) {
        tips.push("🌡️ Monitor temperature to avoid overcooking");
    }

    return tips;
};

/**
 * Format time duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted time string
 */
export const formatDuration = (minutes) => {
    if (minutes < 1) return "< 1 min";
    if (minutes === 1) return "1 min";
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return hours === 1 ? "1 hour" : `${hours} hours`;
    }

    return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get step difficulty level based on various factors
 * @param {Object} step - Step object
 * @returns {string} - Difficulty level (easy, medium, hard)
 */
export const getStepDifficulty = (step) => {
    let difficultyScore = 0;

    // Temperature complexity
    if (step.temperature > 100) difficultyScore += 2;
    else if (step.temperature > 60) difficultyScore += 1;

    // Duration complexity
    if (step.duration > 15) difficultyScore += 2;
    else if (step.duration > 5) difficultyScore += 1;

    // Speed/technique complexity
    if (step.speed > 2) difficultyScore += 1;

    // Action type complexity
    const complexActions = ['fry', 'sauté', 'braise', 'flambé'];
    if (complexActions.includes(step.actionType)) difficultyScore += 1;

    // Tools complexity
    if (step.toolsNeeded?.length > 2) difficultyScore += 1;

    if (difficultyScore <= 2) return 'easy';
    if (difficultyScore <= 4) return 'medium';
    return 'hard';
};

export default {
    getRecipeForPlayMode,
    getMockRecipeForPlayMode,
    getCookingProgress,
    saveCookingSession,
    getCookingTips,
    formatDuration,
    getStepDifficulty
};