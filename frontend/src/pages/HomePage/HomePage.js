import React, { useEffect, useState } from "react";
import TopNav from "../../components/TopNav/TopNav";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import { getAllRecipes, mockRecipes } from "../../services/recipeService";
import "./HomePage.css";

const HomePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                setLoading(true);
                setError("");

                // Fetch recipes from API using the service
                const data = await getAllRecipes();
                setRecipes(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching recipes:", err);
                setError("Failed to load recipes. Please try again later.");
                
                // Fallback to mock data if API call fails
                setRecipes(mockRecipes);
                setLoading(false);
            }
        };

        fetchRecipes();
    }, []);

    // Filter recipes based on search term
    const filterRecipes = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <TopNav />
            <div className="container-main">
                <input
                    className="searchRecipe"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {loading ? (
                    <div className="loading-message">Loading recipes...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="recipe-list">
                        {filterRecipes.length > 0 ? (
                            filterRecipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    id={recipe.id}
                                    title={recipe.title}
                                    description={recipe.description}
                                    cookingTime={recipe.cooking_time || recipe.cookingTime}
                                    preparationTime={recipe.preparation_time || recipe.preparationTime}
                                    imageUrl={recipe.imageUrl}
                                />
                            ))
                        ) : (
                            <div className="no-recipes">No recipes found. Try a different search term.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;