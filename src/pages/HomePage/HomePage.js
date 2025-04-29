import React, {useEffect, useState} from "react";
import TopNav from "../../components/TopNav/TopNav";
import RecipeCard from "../../components/RecipeCard/RecipeCard";
import "./HomePage.css"

const HomePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const mockData = [
          {
            id: 1,
            title: "Spaghetti Carbonara",
            description: "A classic Italian pasta dish with eggs, cheese, pancetta, and pepper.",
            preparationTime: 15,
            cookingTime: 20,
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJvP83iYwVnFr75SD5g0NQGairdAuyg0BWvQ&s"
          },
          {
            id: 2,
            title: "Chicken Alfredo",
            description: "A creamy pasta dish with grilled chicken and a rich Alfredo sauce.",
            preparationTime: 10,
            cookingTime: 25,
          },
          {
            id: 3,
            title: "Caesar Salad",
            description: "A fresh salad with romaine, croutons, Parmesan, and Caesar dressing.",
            preparationTime: 5,
            cookingTime: 0,
          },
        ];
    
        setRecipes(mockData);
      }, []);

    const filterRecipes = recipes.filter((recipe) => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div>
            <TopNav/>
            <div className="container-main">
                <input 
                    className="searchRecipe" 
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="recipe-list">
                    {filterRecipes.map((recipe) => (
                        <RecipeCard
                            key={recipe.id}
                            id={recipe.id}
                            title={recipe.title}
                            description={recipe.description}
                            cookingTime={recipe.cookingTime}
                            preparationTime={recipe.preparationTime}
                            imageUrl={recipe.imageUrl}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HomePage;