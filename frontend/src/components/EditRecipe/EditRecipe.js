import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopNav from "../../components/TopNav/TopNav";
import "./EditRecipe.css";
import "bootstrap/dist/css/bootstrap.min.css";

const EditRecipe = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);

  // Recipe state
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    is_public: true,
    preparation_time: 0,
    cooking_time: 0,
    servings: 1,
  });

  // Steps state
  const [steps, setSteps] = useState([]);

  // Ingredients state
  const [ingredients, setIngredients] = useState([]);

  // Fetch recipe data and available ingredients when component mounts
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch recipe data for editing
        const recipeResponse = await fetch(
          `http://localhost:8000/recipes/${recipeId}/edit`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
          }
        );

        if (!recipeResponse.ok) {
          if (recipeResponse.status === 403) {
            throw new Error("You don't have permission to edit this recipe");
          } else if (recipeResponse.status === 404) {
            throw new Error("Recipe not found");
          }
          throw new Error("Failed to fetch recipe data");
        }

        const recipeData = await recipeResponse.json();

        // Fetch available ingredients
        const ingredientsResponse = await fetch(
          "http://localhost:8000/recipes/ingredients/list",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!ingredientsResponse.ok) {
          throw new Error("Failed to fetch ingredients");
        }

        const ingredientsData = await ingredientsResponse.json();

        // Update state with fetched data
        setRecipe(recipeData.recipe);
        setSteps(recipeData.steps);
        setIngredients(recipeData.ingredients);
        setAvailableIngredients(ingredientsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load recipe data");
        setLoading(false);
      }
    };

    checkAuth();
    fetchData();
  }, [recipeId, navigate]);

  // Handle recipe form changes
  const handleRecipeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRecipe({
      ...recipe,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle step form changes
  const handleStepChange = (index, e) => {
    const { name, value } = e.target;
    const updatedSteps = [...steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [name]: name === "order_number" || name === "temperature" || name === "speed" || name === "duration"
        ? parseInt(value, 10)
        : value,
    };
    setSteps(updatedSteps);
  };

  // Handle ingredient form changes
  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIngredients = [...ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [name]: name === "quantity" ? parseFloat(value) : name === "ingredient_id" ? parseInt(value, 10) : value,
    };
    setIngredients(updatedIngredients);
  };

  // Move step up
  const moveStepUp = (index) => {
    if (index === 0) return; // Can't move first step up

    const newSteps = [...steps];
    // Swap with previous step
    [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];

    // Update order numbers
    newSteps.forEach((step, i) => {
      step.order_number = i + 1;
    });

    setSteps(newSteps);
  };

  // Move step down
  const moveStepDown = (index) => {
    if (index === steps.length - 1) return; // Can't move last step down

    const newSteps = [...steps];
    // Swap with next step
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];

    // Update order numbers
    newSteps.forEach((step, i) => {
      step.order_number = i + 1;
    });

    setSteps(newSteps);
  };

  // Add new step
  const addStep = () => {
    setSteps([
      ...steps,
      {
        order_number: steps.length + 1,
        action_type: "prep",
        temperature: 0,
        speed: 0,
        duration: 0,
        description: "",
      },
    ]);
  };

  // Add new ingredient
  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        ingredient_id: "",
        quantity: 1,
        step_id: null,
      },
    ]);
  };

  // Remove step
  const removeStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = steps.filter((_, i) => i !== index);
      // Update order numbers
      updatedSteps.forEach((step, i) => {
        step.order_number = i + 1;
      });
      setSteps(updatedSteps);
    }
  };

  // Remove ingredient
  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = ingredients.filter((_, i) => i !== index);
      setIngredients(updatedIngredients);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      // Validate inputs
      if (!recipe.title || !recipe.description) {
        setError("Please fill in all required recipe fields");
        setSubmitting(false);
        return;
      }

      // Make sure all steps have descriptions
      for (const step of steps) {
        if (!step.description) {
          setError("All steps must have descriptions");
          setSubmitting(false);
          return;
        }
      }

      // Make sure all ingredients have been selected
      for (const ingredient of ingredients) {
        if (!ingredient.ingredient_id) {
          setError("All ingredients must be selected");
          setSubmitting(false);
          return;
        }
      }

      // Convert string values to proper numbers
      const formattedIngredients = ingredients.map(ing => ({
        ...ing,
        ingredient_id: parseInt(ing.ingredient_id, 10),
        quantity: parseFloat(ing.quantity)
      }));

      const formattedSteps = steps.map(step => ({
        ...step,
        // Remove id if present (we're replacing all steps)
        ...(step.id && { id: undefined }),
        order_number: parseInt(step.order_number, 10),
        temperature: parseInt(step.temperature, 10),
        speed: parseInt(step.speed, 10),
        duration: parseInt(step.duration, 10)
      }));

      // Make sure recipe numeric fields are numbers
      const formattedRecipe = {
        ...recipe,
        preparation_time: parseInt(recipe.preparation_time, 10),
        cooking_time: parseInt(recipe.cooking_time, 10),
        servings: parseInt(recipe.servings, 10)
      };

      // Prepare data for API
      const recipeData = {
        recipe: formattedRecipe,
        steps: formattedSteps,
        ingredients: formattedIngredients
      };

      // Get token for authentication
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Send data to API
      const response = await fetch(`http://localhost:8000/recipes/${recipeId}/complete`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error:", errorData);
        throw new Error(errorData.detail || "Failed to update recipe");
      }

      const data = await response.json();
      setSuccess(true);

      // Redirect to the updated recipe
      setTimeout(() => {
        navigate(`/recipe/${data.id}`);
      }, 2000);

    } catch (err) {
      console.error("Error updating recipe:", err);
      setError(err.message || "Failed to update recipe. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <TopNav />
        <div className="edit-recipe-container">
          <div className="loading">Loading recipe data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <TopNav />
      <div className="edit-recipe-container">
        <h1 className="text-center mb-4">Edit Recipe</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            Recipe updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Recipe Information Section */}
          <div className="card mb-4">
            <div className="card-header">Recipe Information</div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Title*
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  name="title"
                  value={recipe.title}
                  onChange={handleRecipeChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description*
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  rows="3"
                  value={recipe.description}
                  onChange={handleRecipeChange}
                  required
                ></textarea>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="preparation_time" className="form-label">
                    Preparation Time (min)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="preparation_time"
                    name="preparation_time"
                    min="0"
                    value={recipe.preparation_time}
                    onChange={handleRecipeChange}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="cooking_time" className="form-label">
                    Cooking Time (min)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="cooking_time"
                    name="cooking_time"
                    min="0"
                    value={recipe.cooking_time}
                    onChange={handleRecipeChange}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="servings" className="form-label">
                    Servings
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="servings"
                    name="servings"
                    min="1"
                    value={recipe.servings}
                    onChange={handleRecipeChange}
                  />
                </div>
              </div>

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="is_public"
                  name="is_public"
                  checked={recipe.is_public}
                  onChange={handleRecipeChange}
                />
                <label className="form-check-label" htmlFor="is_public">
                  Make recipe public
                </label>
              </div>
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="card mb-4">
            <div className="card-header">Ingredients</div>
            <div className="card-body">
              {ingredients.map((ingredient, index) => (
                <div key={`ingredient-${index}`} className="row mb-3 align-items-center">
                  <div className="col-md-6">
                    <label className="form-label">
                      Ingredient {index + 1}
                    </label>
                    <select
                      className="form-select"
                      name="ingredient_id"
                      value={ingredient.ingredient_id}
                      onChange={(e) => handleIngredientChange(index, e)}
                      required
                    >
                      <option value="">Select an ingredient</option>
                      {availableIngredients.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      min="0.1"
                      step="0.1"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, e)}
                      required
                    />
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-outline-danger mt-3"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addIngredient}
              >
                Add Ingredient
              </button>
            </div>
          </div>

          {/* Steps Section */}
          <div className="card mb-4">
            <div className="card-header">
              Steps
              <small className="text-muted ms-2">(Use arrows to reorder)</small>
            </div>
            <div className="card-body">
              {steps.map((step, index) => (
                <div
                  key={`step-${index}`}
                  className="step-container mb-4 p-3 border rounded"
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h5 className="mb-0">Step {step.order_number}</h5>

                    {/* Reorder buttons */}
                    <div className="step-reorder-buttons">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary me-1"
                        onClick={() => moveStepUp(index)}
                        disabled={index === 0}
                        title="Move step up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => moveStepDown(index)}
                        disabled={index === steps.length - 1}
                        title="Move step down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description*</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="2"
                      value={step.description}
                      onChange={(e) => handleStepChange(index, e)}
                      required
                    ></textarea>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Action Type</label>
                      <select
                        className="form-select"
                        name="action_type"
                        value={step.action_type}
                        onChange={(e) => handleStepChange(index, e)}
                      >
                        <option value="prep">Preparation</option>
                        <option value="cook">Cooking</option>
                        <option value="mix">Mixing</option>
                        <option value="rest">Resting</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Temperature (°C)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="temperature"
                        min="0"
                        value={step.temperature}
                        onChange={(e) => handleStepChange(index, e)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Speed (0-10)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="speed"
                        min="0"
                        max="10"
                        value={step.speed}
                        onChange={(e) => handleStepChange(index, e)}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Duration (min)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="duration"
                        min="0"
                        value={step.duration}
                        onChange={(e) => handleStepChange(index, e)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                  >
                    Remove Step
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={addStep}
              >
                Add Step
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-4">
            <button
              type="button"
              className="btn btn-secondary me-md-2"
              onClick={() => navigate(`/recipe/${recipeId}`)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || success}
            >
              {submitting ? "Updating..." : "Update Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipe;