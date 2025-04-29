import React from "react";
import TopNav from "../../components/TopNav/TopNav";
import Recipe from "../../components/Recipe/Recipe";
import "./RecipePage.css"
import { useParams } from "react-router-dom";

const RecipePage = () => {
    const  {recipeId} = useParams();
    return (
        <div className="body">
            <TopNav/>
            <Recipe recipeId={recipeId}/>
        </div>
    )
}

export default RecipePage