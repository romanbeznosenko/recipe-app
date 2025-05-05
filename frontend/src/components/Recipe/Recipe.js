import React, { useState, useEffect } from "react";
import Step from "../Step/Step";
import { getCompleteRecipe, getMockRecipe } from "../../services/recipeDetailService";
import "./Recipe.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Recipe = ({ recipeId }) => {
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
    
    useEffect(() => {
        const fetchRecipeData = async () => {
            if (!recipeId) return;
            
            try {
                setLoading(true);
                setError("");
                
                // Use the service to fetch complete recipe data
                const completeRecipe = await getCompleteRecipe(recipeId);
                setRecipe(completeRecipe);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching recipe:", err);
                setError(err.message || "Failed to load recipe data");
                
                // Fallback to mock data in development
                if (process.env.NODE_ENV === 'development') {
                    console.log("Using fallback mock data");
                    const mockRecipe = getMockRecipe(recipeId);
                    setRecipe(mockRecipe);
                }
                
                setLoading(false);
            }
        };
        
        if (recipeId) {
            fetchRecipeData();
        }
    }, [recipeId]);
    
    if (loading) {
        return <div className="loading">Loading recipe...</div>;
    }
    
    if (error && recipe.title === "Loading...") {
        return (
            <div className="error-container">
                <div className="error-message">{error}</div>
                <button className="btn btn-primary" onClick={() => window.history.back()}>
                    Go Back
                </button>
            </div>
        );
    }
    
    return (
        <div className="recipe-container">
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="recipe-left-column">
                        <h1>{recipe.title}</h1>
                        <img src={recipe.imgUrl} title={recipe.title} alt={recipe.title}/>
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