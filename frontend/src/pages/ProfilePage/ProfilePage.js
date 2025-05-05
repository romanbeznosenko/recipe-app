import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav/TopNav";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import "./ProfilePage.css";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Check for authentication on page load
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            const userData = localStorage.getItem("user");
            
            if (!token || !userData) {
                navigate("/login");
                return;
            }
            
            try {
                setUser(JSON.parse(userData));
                fetchUserRecipes();
            } catch (err) {
                console.error("Error parsing user data:", err);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
        };
        
        checkAuth();
    }, [navigate]);

    // Fetch user's recipes
    const fetchUserRecipes = async () => {
        try {
            setLoading(true);
            
            // In a real app, you would fetch user's recipes from an API endpoint
            // Example API call:
            // const response = await fetch(`http://localhost:8000/recipes/user/${user.id}`, {
            //     headers: {
            //         "Authorization": `Bearer ${localStorage.getItem("token")}`
            //     }
            // });
            // const data = await response.json();
            // setRecipes(data);
            
            // For development, using mock data
            const mockData = [
                {
                    id: 1,
                    title: "Homemade Pizza",
                    description: "A delicious pizza with homemade dough and fresh toppings.",
                    preparationTime: 30,
                    cookingTime: 15,
                    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                },
                {
                    id: 2,
                    title: "Vegetable Curry",
                    description: "A spicy curry with seasonal vegetables and coconut milk.",
                    preparationTime: 20,
                    cookingTime: 30,
                },
                {
                    id: 3,
                    title: "Banana Bread",
                    description: "Moist and delicious banana bread with walnuts.",
                    preparationTime: 15,
                    cookingTime: 45,
                },
            ];
            
            // Simulate API delay
            setTimeout(() => {
                setRecipes(mockData);
                setLoading(false);
            }, 500);
        } catch (err) {
            console.error("Error fetching recipes:", err);
            setError("Failed to load recipes. Please try again later.");
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div>
                <TopNav />
                <div className="profile-container">
                    <div className="loading-container">
                        <p>Loading user data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <TopNav />
            <div className="profile-container">
                {/* Left Sidebar */}
                <div className="profile-sidebar">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {/* Using placeholder avatar as your API may not provide one */}
                            <img src="https://via.placeholder.com/150" alt={user.username} />
                        </div>
                        <h2 className="username">{user.username}</h2>
                        <div className="user-stats">
                            <div className="stat-item">
                                <span className="stat-value">{recipes.length}</span>
                                <span className="stat-label">Recipes</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">0</span>
                                <span className="stat-label">Following</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">0</span>
                                <span className="stat-label">Followers</span>
                            </div>
                        </div>
                        <div className="user-actions">
                            <button className="edit-profile-btn">Edit Profile</button>
                            <button className="create-recipe-btn">Create Recipe</button>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="profile-main">
                    <h1>My Recipes</h1>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    {loading ? (
                        <div className="loading">Loading recipes...</div>
                    ) : (
                        <div className="recipe-list">
                            {recipes.length > 0 ? (
                                recipes.map((recipe) => (
                                    <RecipeCard
                                        key={recipe.id}
                                        id={recipe.id}
                                        title={recipe.title}
                                        description={recipe.description}
                                        preparationTime={recipe.preparationTime}
                                        cookingTime={recipe.cookingTime}
                                        imageUrl={recipe.imageUrl}
                                    />
                                ))
                            ) : (
                                <p className="no-recipes">You haven't created any recipes yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;