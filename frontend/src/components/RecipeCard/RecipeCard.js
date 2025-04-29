import React from "react";
import { useNavigate } from "react-router-dom";
import "./RecipeCard.css";

const RecipeCard = ({ 
    id,
    title, 
    description, 
    cookingTime, 
    preparationTime,
    imageUrl = "https://cozypeachkitchen.com/wp-content/uploads/2019/04/lemon-hummus-pasta-featured.jpg"
}) => {
  const navigate = useNavigate();

  const handleOpenRecipe = () => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="recipe-card">
      <div className="recipe-image">
        <img src={imageUrl} alt={title} />
      </div>

      <div className="recipe-content">
        <h2 className="recipe-title">{title}</h2>
        <p className="recipe-description">{description}</p>

        <div className="recipe-bottom">
          <div className="recipe-times">
            <span>Preparation Time: {preparationTime} minutes</span>
            <span>Cooking Time: {cookingTime} minutes</span>
          </div>
          <div className="recipe-button">
            <button onClick={handleOpenRecipe}>Open Recipe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;