import React from "react";
import Step from "../Step/Step";
import "./Recipe.css";
import "bootstrap/dist/css/bootstrap.min.css";

const Recipe = ({title="Spaghetti Carbonara", imgUrl="https://www.forksoverknives.com/uploads/lemon-hummus-pasta-wordpress.jpg?auto=webp"}) => {
    return (
        <div className="recipe-container">
            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="recipe-left-column">
                        <h1>{title}</h1>
                        <img src={imgUrl} title="Recipe Title"/>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="recipe-right-column">
                        <p>
                            Hummus, with its nutty and garlicky flavor, makes a fantastic dip, 
                            spread or even a salad dressing, but it can also be a great base for a pasta sauce. 
                            A little garlic and shallot sizzled in olive oil, along with fresh lemon juice and zest, 
                            help amp up premade hummus. With a little water, the hummus thins out enough to become 
                            a creamy sauce to fully coat noodles. You can add chickpeas, fresh herbs, za’atar or 
                            almost any roasted or fresh vegetable to this pasta and it will feel like your own.
                        </p>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="recipe-ingridients">    
                                    <span><strong>Yield:</strong> 4 servings</span>
                                    <span>Salt</span>
                                    <span>12 ounces spaghetti</span>
                                    <span>1/4 cup olive oil</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="recipe-preparation">
                                    <Step 
                                        stepNumber="Step 1" 
                                        description="Pour 2 liters of water into the DreamFoodX bowl, add salt, bring to a boil. Add the pasta and cook until tender. Drain, reserving 1 cup of pasta water."
                                        temperature="100"
                                        speed="2"
                                        duration="10"

                                    />
                                    <Step 
                                        stepNumber="Step 2" 
                                        description="Heat olive oil in a pan, add garlic and shallots, and sauté until fragrant. Add hummus and thin with pasta water to create the sauce."
                                        temperature="90"
                                        speed="1"
                                        duration="15"
                                    />
                                    <Step 
                                        stepNumber="Step 3" 
                                        description="Combine the cooked pasta with the hummus sauce. Add any desired herbs or veggies and mix well."
                                        temperature="20"
                                        speed="0"
                                        duration="5"
                                    />
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
