import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav/TopNav";
import "./CreateRecipe.css";
import "bootstrap/dist/css/bootstrap.min.css";

// DreamFoodX Action Types Configuration
const DREAMFOODX_ACTIONS = {
    chop: {
        label: "Chop",
        icon: "🔪",
        description: "Chopping ingredients to various sizes",
        temperature: { show: false, default: 0 },
        speed: { show: true, default: 5, min: 3, max: 10 },
        duration: { show: true, default: 1, min: 1, max: 60 },
        tips: "Speed 5-8 for vegetables, 8-10 for hard ingredients"
    },
    mix: {
        label: "Mix",
        icon: "🌀",
        description: "Gentle mixing of ingredients",
        temperature: { show: false, default: 0 },
        speed: { show: true, default: 2, min: 1, max: 4 },
        duration: { show: true, default: 2, min: 1, max: 30 },
        tips: "Low speeds for delicate ingredients"
    },
    cook: {
        label: "Cook",
        icon: "🔥",
        description: "Cooking with stirring",
        temperature: { show: true, default: 100, min: 37, max: 120 },
        speed: { show: true, default: 1, min: 1, max: 3 },
        duration: { show: true, default: 10, min: 2, max: 120 },
        tips: "Speed 1-2 to avoid splashing"
    },
    fry: {
        label: "Fry",
        icon: "🍳",
        description: "Frying with stirring",
        temperature: { show: true, default: 120, min: 80, max: 160 },
        speed: { show: true, default: 1, min: 1, max: 2 },
        duration: { show: true, default: 5, min: 1, max: 60 },
        tips: "100-120°C for vegetables, 140-160°C for meat"
    },
    steam: {
        label: "Steam",
        icon: "💨",
        description: "Steam cooking (Varoma)",
        temperature: { show: true, default: 100, min: 90, max: 120 },
        speed: { show: false, default: 0 },
        duration: { show: true, default: 15, min: 3, max: 120 },
        tips: "Use Varoma basket or steaming insert"
    },
    knead: {
        label: "Knead",
        icon: "🍞",
        description: "Kneading dough",
        temperature: { show: false, default: 0 },
        speed: { show: false, default: 0 },
        duration: { show: true, default: 3, min: 1, max: 15 },
        tips: "Kneading function works automatically"
    },
    emulsify: {
        label: "Emulsify",
        icon: "🥄",
        description: "Creating emulsions and sauces",
        temperature: { show: false, default: 0 },
        speed: { show: true, default: 4, min: 3, max: 7 },
        duration: { show: true, default: 2, min: 1, max: 10 },
        tips: "Add oil slowly while emulsifying"
    },
    blend: {
        label: "Blend",
        icon: "🥤",
        description: "Blending to smooth consistency",
        temperature: { show: false, default: 0 },
        speed: { show: true, default: 8, min: 6, max: 10 },
        duration: { show: true, default: 1, min: 1, max: 5 },
        tips: "High speeds create smooth consistency"
    },
    weigh: {
        label: "Weigh",
        icon: "⚖️",
        description: "Weighing ingredients",
        temperature: { show: false, default: 0 },
        speed: { show: false, default: 0 },
        duration: { show: false, default: 0 },
        tips: "Use tare function before adding next ingredient"
    },
    rest: {
        label: "Rest",
        icon: "⏱️",
        description: "Waiting or resting time",
        temperature: { show: false, default: 0 },
        speed: { show: false, default: 0 },
        duration: { show: true, default: 10, min: 1, max: 180 },
        tips: "Time for dough to rise or ingredients to cool"
    }
};

const CreateRecipe = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
    const [steps, setSteps] = useState([
        {
            order_number: 1,
            action_type: "mix",
            temperature: 0,
            speed: 2,
            duration: 2,
            description: "",
        },
    ]);

    // Ingredients state
    const [ingredients, setIngredients] = useState([
        {
            ingredient_id: "",
            quantity: 1,
            step_id: null,
        },
    ]);

    // Get action configuration
    const getActionConfig = (actionType) => {
        return DREAMFOODX_ACTIONS[actionType] || DREAMFOODX_ACTIONS.mix;
    };

    // Calculate total cooking time from steps duration (now in minutes)
    const calculateTotalCookingTime = (stepsArray) => {
        return stepsArray.reduce((total, step) => {
            return total + (parseInt(step.duration, 10) || 0);
        }, 0);
    };

    // Format duration helper - now expects minutes
    const formatDuration = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    };

    // Update cooking time whenever steps change
    useEffect(() => {
        if (steps.length > 0) {
            const calculatedTime = calculateTotalCookingTime(steps);
            setRecipe(prevRecipe => ({
                ...prevRecipe,
                cooking_time: calculatedTime
            }));
        }
    }, [steps]);

    // Fetch available ingredients when component mounts
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
            }
        };

        const fetchIngredients = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "http://localhost:8000/recipes/ingredients/list",
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch ingredients");
                }

                const data = await response.json();
                setAvailableIngredients(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching ingredients:", err);
                setError("Failed to load ingredients. Please try again later.");
                setLoading(false);
            }
        };

        checkAuth();
        fetchIngredients();
    }, [navigate]);

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

        // If action type changed, reset parameters to defaults
        if (name === "action_type") {
            const config = getActionConfig(value);
            updatedSteps[index] = {
                ...updatedSteps[index],
                action_type: value,
                temperature: config.temperature.default,
                speed: config.speed.default,
                duration: config.duration.default
            };
        } else {
            updatedSteps[index] = {
                ...updatedSteps[index],
                [name]: name === "order_number" || name === "temperature" || name === "speed" || name === "duration"
                    ? parseInt(value, 10)
                    : value,
            };
        }

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
        if (index === 0) return;

        const newSteps = [...steps];
        [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];

        newSteps.forEach((step, i) => {
            step.order_number = i + 1;
        });

        setSteps(newSteps);
    };

    // Move step down
    const moveStepDown = (index) => {
        if (index === steps.length - 1) return;

        const newSteps = [...steps];
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];

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
                action_type: "mix",
                temperature: 0,
                speed: 2,
                duration: 2,
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
            setLoading(true);
            setError("");

            // Validate inputs
            if (!recipe.title || !recipe.description) {
                setError("Please fill in all required recipe fields");
                setLoading(false);
                return;
            }

            // Make sure all steps have descriptions
            for (const step of steps) {
                if (!step.description) {
                    setError("All steps must have descriptions");
                    setLoading(false);
                    return;
                }
            }

            // Make sure all ingredients have been selected
            for (const ingredient of ingredients) {
                if (!ingredient.ingredient_id) {
                    setError("All ingredients must be selected");
                    setLoading(false);
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

            // Log the data being sent (for debugging)
            console.log("Sending data:", JSON.stringify(recipeData));

            // Get token for authentication
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            // Send data to API
            const response = await fetch("http://localhost:8000/recipes/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(recipeData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API error:", errorData);
                throw new Error(errorData.detail || "Failed to create recipe");
            }

            const data = await response.json();
            setSuccess(true);

            // Redirect to the newly created recipe
            setTimeout(() => {
                navigate(`/recipe/${data.id}`);
            }, 2000);

        } catch (err) {
            console.error("Error creating recipe:", err);
            setError(err.message || "Failed to create recipe. Please try again.");
            setLoading(false);
        }
    };

    if (loading && availableIngredients.length === 0) {
        return (
            <div>
                <TopNav />
                <div className="create-recipe-container">
                    <div className="loading">Loading ingredients...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <TopNav />
            <div className="create-recipe-container">
                <h1 className="text-center mb-4">Create DreamFoodX Recipe</h1>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && (
                    <div className="alert alert-success">
                        Recipe created successfully! Redirecting...
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Recipe Information Section */}
                    <div className="card mb-4">
                        <div className="card-header">Recipe Information</div>
                        <div className="card-body">
                            <div className="mb-3">
                                <label htmlFor="title" className="form-label">
                                    Recipe Name*
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
                                <div className="col-md-6 mb-3">
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

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="cooking_time" className="form-label">
                                        Total Cooking Time (auto-calculated)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        id="cooking_time"
                                        name="cooking_time"
                                        value={recipe.cooking_time}
                                        disabled
                                        readOnly
                                        style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                    />
                                    <small className="form-text text-muted">
                                        Automatically calculated from step durations: {formatDuration(recipe.cooking_time)}
                                    </small>
                                </div>

                                <div className="col-md-6 mb-3">
                                    <label htmlFor="servings" className="form-label">
                                        Number of Servings
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
                            DreamFoodX Steps
                            <small className="text-muted ms-2">(Use arrows to reorder)</small>
                        </div>
                        <div className="card-body">
                            {steps.map((step, index) => {
                                const actionConfig = getActionConfig(step.action_type);
                                return (
                                    <div
                                        key={`step-${index}`}
                                        className="step-container mb-4 p-3 border rounded"
                                    >
                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                            <h5 className="mb-0">
                                                {actionConfig.icon} Step {step.order_number}: {actionConfig.label}
                                            </h5>

                                            {/* Reorder buttons */}
                                            <div className="step-reorder-buttons">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary me-1"
                                                    onClick={() => moveStepUp(index)}
                                                    disabled={index === 0}
                                                    title="Move up"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => moveStepDown(index)}
                                                    disabled={index === steps.length - 1}
                                                    title="Move down"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">DreamFoodX Function</label>
                                            <select
                                                className="form-select"
                                                name="action_type"
                                                value={step.action_type}
                                                onChange={(e) => handleStepChange(index, e)}
                                            >
                                                {Object.entries(DREAMFOODX_ACTIONS).map(([key, config]) => (
                                                    <option key={key} value={key}>
                                                        {config.icon} {config.label}
                                                    </option>
                                                ))}
                                            </select>
                                            {actionConfig.tips && (
                                                <small className="form-text text-muted">
                                                    💡 {actionConfig.tips}
                                                </small>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Step Description*</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                rows="2"
                                                value={step.description}
                                                onChange={(e) => handleStepChange(index, e)}
                                                placeholder={`Describe what DreamFoodX should do in this step (${actionConfig.description})`}
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="row mb-3">
                                            {/* Temperature field - only show if action supports it */}
                                            {actionConfig.temperature.show && (
                                                <div className="col-md-4">
                                                    <label className="form-label">
                                                        Temperature (°C)
                                                        {actionConfig.temperature.min > 0 && (
                                                            <small className="text-muted">
                                                                {" "}({actionConfig.temperature.min}-{actionConfig.temperature.max}°C)
                                                            </small>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="temperature"
                                                        min={actionConfig.temperature.min || 0}
                                                        max={actionConfig.temperature.max || 200}
                                                        value={step.temperature}
                                                        onChange={(e) => handleStepChange(index, e)}
                                                    />
                                                </div>
                                            )}

                                            {/* Speed field - only show if action supports it */}
                                            {actionConfig.speed.show && (
                                                <div className="col-md-4">
                                                    <label className="form-label">
                                                        Speed (1-10)
                                                        {actionConfig.speed.min > 0 && (
                                                            <small className="text-muted">
                                                                {" "}(recommended: {actionConfig.speed.min}-{actionConfig.speed.max})
                                                            </small>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="speed"
                                                        min={actionConfig.speed.min || 0}
                                                        max={actionConfig.speed.max || 10}
                                                        value={step.speed}
                                                        onChange={(e) => handleStepChange(index, e)}
                                                    />
                                                </div>
                                            )}

                                            {/* Duration field - only show if action supports it */}
                                            {actionConfig.duration.show && (
                                                <div className="col-md-4">
                                                    <label className="form-label">
                                                        Time (minutes)
                                                        {step.duration > 0 && (
                                                            <small className="text-muted">
                                                                {" "}({formatDuration(step.duration)})
                                                            </small>
                                                        )}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="duration"
                                                        min={actionConfig.duration.min || 0}
                                                        max={actionConfig.duration.max || 180}
                                                        value={step.duration}
                                                        onChange={(e) => handleStepChange(index, e)}
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Action summary */}
                                        <div className="alert alert-light mb-3">
                                            <strong>Summary:</strong>{" "}
                                            {actionConfig.label}
                                            {actionConfig.temperature.show && step.temperature > 0 &&
                                                ` at ${step.temperature}°C`}
                                            {actionConfig.speed.show && step.speed > 0 &&
                                                ` with speed ${step.speed}`}
                                            {actionConfig.duration.show && step.duration > 0 &&
                                                ` for ${formatDuration(step.duration)}`}
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
                                );
                            })}

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
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || success}
                        >
                            {loading ? "Creating..." : "Create Recipe"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRecipe;