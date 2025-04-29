import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopNav.css"

const TopNav = () => {
    const navigate = useNavigate();

    return (
        <nav className="top-nav">
            <button onClick={() => navigate("/home")}>Recipe+</button>
            <button onClick={() => navigate("/home")}>Recipes</button>
            <button onClick={() => navigate("/home")}>Profile</button>
        </nav>
    )
}

export default TopNav;