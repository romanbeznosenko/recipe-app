import React from "react";
import TopNav from "../../components/TopNav/TopNav";
import Recipe from "../../components/Recipe/Recipe";
import "./RecipePage.css"

const RecipePage = () => {
    return (
        <div className="body">
            <TopNav/>
            <Recipe/>
        </div>
    )
}

export default RecipePage