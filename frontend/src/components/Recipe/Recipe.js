import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Step from "../Step/Step";
import "./Recipe.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Recipe = ({ recipeId }) => {
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState({
        title: "Loading...",
        imgUrl: "",
        description: "",
        servings: "",
        preparation_time: 0,
        cooking_time: 0,
        ingredients: [],
        steps: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const fetchRecipeData = async () => {
            if (!recipeId) return;

            try {
                setLoading(true);

                // Get user data if authenticated
                const token = localStorage.getItem("token");
                let userData = null;
                if (token) {
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                        try {
                            userData = JSON.parse(userStr);
                        } catch (err) {
                            console.error("Error parsing user data:", err);
                        }
                    }
                }

                // Fetch recipe details
                const recipeResponse = await fetch(`http://localhost:8000/recipes/${recipeId}`, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                if (!recipeResponse.ok) {
                    if (recipeResponse.status === 404) {
                        throw new Error("Recipe not found");
                    }
                    throw new Error(`Error: ${recipeResponse.status}`);
                }

                const recipeData = await recipeResponse.json();

                // Check if user is the owner
                if (userData && recipeData.user_id === userData.id) {
                    setIsOwner(true);
                }

                // Fetch recipe ingredients
                const ingredientsResponse = await fetch(`http://localhost:8000/recipes/${recipeId}/ingredients`, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                let ingredientsData = [];
                if (ingredientsResponse.ok) {
                    ingredientsData = await ingredientsResponse.json();
                }

                // Fetch recipe steps
                const stepsResponse = await fetch(`http://localhost:8000/recipes/${recipeId}/steps`, {
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                let stepsData = [];
                if (stepsResponse.ok) {
                    stepsData = await stepsResponse.json();
                    // Format steps to match your Step component requirements
                    stepsData = stepsData.sort((a, b) => a.order_number - b.order_number)
                        .map(step => ({
                            stepNumber: `Step ${step.order_number}`,
                            description: step.description,
                            temperature: step.temperature.toString(),
                            speed: step.speed.toString(),
                            duration: step.duration.toString()
                        }));
                }

                // Format ingredients
                const formattedIngredients = ingredientsData.map(ingredient =>
                    `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`
                );

                // Combine all data
                setRecipe({
                    ...recipeData,
                    ingredients: formattedIngredients,
                    steps: stepsData,
                    // Default image if none provided
                    imgUrl: recipeData.image_url || "https://via.placeholder.com/400x300?text=No+Image"
                });

                setLoading(false);
            } catch (err) {
                console.error("Error fetching recipe:", err);
                setError(err.message || "Failed to load recipe data");
                setLoading(false);

                // Fallback to mock data in development
                if (process.env.NODE_ENV === 'development') {
                    provideMockData();
                }
            }
        };

        // Fallback function to provide mock data during development
        const provideMockData = () => {
            const mockRecipe = {
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
                        description: "Pour 2 liters of water into the bowl, add salt, bring to a boil. Add the pasta and cook until tender. Drain, reserving 1 cup of pasta water.",
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

            setRecipe(mockRecipe);
            setLoading(false);
        };

        if (recipeId) {
            fetchRecipeData();
        }
    }, [recipeId, navigate]);

    const handleBackClick = () => {
        navigate(-1);
    };

    if (loading) {
        return <div className="loading">Loading recipe...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={handleBackClick}>
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="recipe-container">
            {/* New top actions section with back and edit buttons */}
            <div className="recipe-top-actions">
                <button className="back-button btn btn-outline-secondary" onClick={handleBackClick}>
                    ← Back
                </button>
                {isOwner && (
                    <button
                        className="btn btn-outline-primary edit-recipe-btn"
                        onClick={() => navigate(`/edit-recipe/${recipeId}`)}
                    >
                        Edit Recipe
                    </button>
                )}
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="recipe-left-column">
                        <div className="recipe-title-row">
                            <h1>{recipe.title}</h1>
                        </div>
                        <img src={recipe.imgUrl} title={recipe.title} alt={recipe.title} />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="recipe-right-column">
                        <p>{recipe.description}</p>
                        <div className="recipe-meta">
                            <span><strong>Servings:</strong> {recipe.servings || recipe.yield}</span>
                            <span><strong>Preparation Time:</strong> {recipe.preparation_time} minutes</span>
                            <span><strong>Cooking Time:</strong> {recipe.cooking_time} minutes</span>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="recipe-ingridients">
                                    <h3>Ingredients</h3>
                                    {recipe.ingredients.length > 0 ? (
                                        recipe.ingredients.map((ingredient, index) => (
                                            <span key={index}>{ingredient}</span>
                                        ))
                                    ) : (
                                        <span>No ingredients available</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="recipe-preparation">
                                    <h3>Instructions</h3>
                                    {recipe.steps.length > 0 ? (
                                        recipe.steps.map((step, index) => (
                                            <Step
                                                key={index}
                                                stepNumber={step.stepNumber}
                                                description={step.description}
                                                temperature={step.temperature}
                                                speed={step.speed}
                                                duration={step.duration}
                                            />
                                        ))
                                    ) : (
                                        <span>No instructions available</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Recipe;