import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav/TopNav";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import { getCurrentUserRecipes, mockRecipes } from "../../services/recipeService";
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
            } catch (err) {
                console.error("Error parsing user data:", err);
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
            }
        };
        
        checkAuth();
    }, [navigate]);

    // Fetch user's recipes when user data is available
    useEffect(() => {
        const fetchUserRecipes = async () => {
            if (!user) return;
            
            try {
                setLoading(true);
                setError("");
                
                // Get token from localStorage
                const token = localStorage.getItem("token");
                
                // Fetch user's recipes using the service
                const data = await getCurrentUserRecipes(token);
                setRecipes(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching recipes:", err);
                
                // If unauthorized (401), redirect to login
                if (err.message.includes("401")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }
                
                setError("Failed to load recipes. Please try again later.");
                // Fallback to mock data in development
                setRecipes(mockRecipes);
                setLoading(false);
            }
        };
        
        fetchUserRecipes();
    }, [user, navigate]);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
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
                        <p className="user-email">{user.email}</p>
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
                            <button className="logout-btn" onClick={handleLogout}>Logout</button>
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
                                        preparationTime={recipe.preparation_time || recipe.preparationTime}
                                        cookingTime={recipe.cooking_time || recipe.cookingTime}
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