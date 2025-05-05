import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TopNav.css";

const TopNav = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    
    // Check for user on component mount
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (err) {
                console.error("Error parsing user data:", err);
            }
        }
    }, []);
    
    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };
    
    return (
        <nav className="top-nav">
            <button onClick={() => navigate("/home")}>Recipe+</button>
            <button onClick={() => navigate("/home")}>Recipes</button>
            <button onClick={() => navigate("/profile")}>Profile</button>
            {user && (
                <button onClick={handleLogout}>Logout</button>
            )}
        </nav>
    );
};

export default TopNav;