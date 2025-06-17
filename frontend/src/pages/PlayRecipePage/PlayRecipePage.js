import React, { useState, useEffect } from 'react';
import { getRecipeForPlayMode, getMockRecipeForPlayMode, getCookingTips } from '../../services/playRecipeService';
import './PlayRecipePage.css';

// DreamFoodX Actions Configuration
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

const PlayRecipePage = () => {
    // Get recipe ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const recipeIdFromUrl = urlParams.get('recipeId') || '1'; // Fallback to ID 1

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [completedSteps, setCompletedSteps] = useState(new Set());
    const [cookingTips, setCookingTips] = useState([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [flashNextButton, setFlashNextButton] = useState(false);
    const [stepStarted, setStepStarted] = useState(false);

    // Fetch recipe data from API
    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                setLoading(true);
                setError('');

                // Try to fetch real data first
                const recipeData = await getRecipeForPlayMode(recipeIdFromUrl);
                setRecipe(recipeData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching recipe data:', err);
                setError('Using demo data - API connection failed');

                // Fallback to mock data
                const mockData = getMockRecipeForPlayMode(recipeIdFromUrl);
                setRecipe(mockData);
                setLoading(false);
            }
        };

        fetchRecipeData();
    }, [recipeIdFromUrl]);

    // Update cooking tips when step changes
    useEffect(() => {
        if (recipe?.steps[currentStep]) {
            const tips = getCookingTips(recipe.steps[currentStep]);
            setCookingTips(tips);
        }
    }, [currentStep, recipe]);

    const currentStepData = recipe?.steps[currentStep];
    const totalSteps = recipe?.steps.length || 0;

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCompletedSteps(prev => new Set([...prev, currentStep]));
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const goToStep = (stepIndex) => {
        setCurrentStep(stepIndex);
    };

    const startCooking = () => {
        setIsPlaying(true);
        setCurrentStep(0);
        setCompletedSteps(new Set());
    };

    const finishCooking = () => {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setIsPlaying(false);
        setCurrentStep(0);
    };

    const getActionConfig = (actionType) => {
        return DREAMFOODX_ACTIONS[actionType] || DREAMFOODX_ACTIONS.mix;
    };

    const getActionIcon = (actionType) => {
        const config = getActionConfig(actionType);
        return config.icon || '👨‍🍳';
    };

    const getActionLabel = (actionType) => {
        const config = getActionConfig(actionType);
        return config.label || actionType;
    };

    const getTemperatureColor = (temp) => {
        if (temp === 0) return '#6c757d';
        if (temp <= 40) return '#17a2b8';
        if (temp <= 80) return '#ffc107';
        return '#dc3545';
    };
    
    // Reset step state when moving to a new step
    useEffect(() => {
        setStepStarted(false);
        setElapsedTime(0);
        setFlashNextButton(false);
    }, [currentStepData]);

    // Timer logic that only runs if stepStarted is true
    useEffect(() => {
        if (!isPlaying || !currentStepData?.duration || !stepStarted) return;

        const interval = setInterval(() => {
            setElapsedTime(prev => {
                const totalSeconds = currentStepData.duration * 60;
                const next = prev + 1;

                if (next >= totalSeconds) {
                    clearInterval(interval);
                    setFlashNextButton(true);
                    return totalSeconds;
                }

                return next;
            });
        }, 10); // 10ms for presentation

        return () => clearInterval(interval);
    }, [currentStepData, isPlaying, stepStarted]);



    if (loading) {
        return (
            <div className="play-recipe-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (error && !recipe) {
        return (
            <div className="play-recipe-container">
                <div className="error-container">
                    <div className="error-message">
                        <h3>⚠️ Error Loading Recipe</h3>
                        <p>{error}</p>
                        <button
                            className="retry-button"
                            onClick={() => window.location.reload()}
                        >
                            🔄 Retry
                        </button>
                        <button
                            className="back-button"
                            onClick={() => window.history.back()}
                        >
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="play-recipe-container">
                <div className="error-container">
                    <div className="error-message">
                        <h3>Recipe Not Found</h3>
                        <p>The recipe you're looking for doesn't exist or couldn't be loaded.</p>
                        <button
                            className="back-button"
                            onClick={() => window.history.back()}
                        >
                            ← Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!isPlaying) {
        return (
            <div className="play-recipe-container">
                <div className="recipe-overview">
                    <button className="back-button" onClick={() => window.history.back()}>
                        ← Back to Recipe
                    </button>

                    <div className="recipe-header">
                        <h1>{recipe.title}</h1>
                        <p className="recipe-description">{recipe.description}</p>

                        <div className="recipe-meta">
                            <div className="meta-item">
                                <span className="meta-label">Servings:</span>
                                <span className="meta-value">{recipe.servings}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Prep Time:</span>
                                <span className="meta-value">{recipe.preparation_time} min</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Cook Time:</span>
                                <span className="meta-value">{recipe.cooking_time} min</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Total Steps:</span>
                                <span className="meta-value">{totalSteps}</span>
                            </div>
                        </div>
                    </div>

                    <div className="steps-preview">
                        <h3>Recipe Steps Overview</h3>
                        <div className="steps-list">
                            {recipe.steps.map((step, index) => (
                                <div key={index} className="step-preview">
                                    <div className="step-number">{step.stepNumber}</div>
                                    <div className="step-content">
                                        <div className="step-header">
                                            <span className="action-icon">{getActionIcon(step.actionType)}</span>
                                            <span className="action-type">{getActionLabel(step.actionType).toUpperCase()}</span>
                                            <span className="step-duration">{step.duration} min</span>
                                        </div>
                                        <p className="step-description">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="start-cooking-section">
                        <button className="start-cooking-btn" onClick={startCooking}>
                            🎯 Start Cooking
                        </button>
                        <p className="cooking-tip">
                            💡 Tip: Have all ingredients ready before starting!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="play-recipe-container">
            {/* Header with progress */}
            <div className="cooking-header">
                <button className="exit-cooking-btn" onClick={() => setIsPlaying(false)}>
                    ✕ Exit Cooking Mode
                </button>

                <div className="progress-section">
                    <div className="progress-info">
                        <span>Step {currentStep + 1} of {totalSteps}</span>
                        <span className="recipe-title">{recipe.title}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="step-navigation-dots">
                    {recipe.steps.map((_, index) => (
                        <button
                            key={index}
                            className={`step-dot ${index === currentStep ? 'active' : ''} ${completedSteps.has(index) ? 'completed' : ''}`}
                            onClick={() => goToStep(index)}
                        >
                            {completedSteps.has(index) ? '✓' : index + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main cooking interface */}
            <div className="cooking-main">
                <div className="step-info">
                    <div className="step-header">
                        <div className="step-number-large">
                            {getActionIcon(currentStepData.actionType)} Step {currentStepData.stepNumber}: {getActionLabel(currentStepData.actionType)}
                        </div>
                        <div className="step-parameters">
                            <div className="parameter">
                                <span className="param-label">Temperature</span>
                                <span
                                    className="param-value temperature"
                                    style={{ color: getTemperatureColor(currentStepData.temperature) }}
                                >
                                    {currentStepData.temperature}°C
                                </span>
                            </div>
                            <div className="parameter">
                                <span className="param-label">Speed</span>
                                <span className="param-value">{currentStepData.speed}</span>
                            </div>
                            <div className="parameter">
                                <span className="param-label">Duration</span>
                                <span className="param-value">{currentStepData.duration} min</span>
                            </div>
                        </div>
                    </div>

                    <div className="step-description">
                        <p>{currentStepData.description}</p>
                    </div>

                    {/* Step timer-slider interface */}
                    <div className="step-timer">
                        <label>⏳ Step Progress</label>
                        <div className="timer-slider">
                            <progress
                                value={elapsedTime}
                                max={currentStepData.duration * 60}
                            ></progress>
                            <div className="time-labels">
                                <span>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                                <span>{currentStepData.duration}:00</span>
                            </div>
                        </div>
                    </div>

                    {/* Action-specific instructions */}
                    <div className="action-instructions">
                        <h4>🎯 DreamFoodX Instructions:</h4>
                        <div className="action-summary">
                            <strong>{getActionLabel(currentStepData.actionType)}</strong>
                            {currentStepData.temperature > 0 &&
                                ` at ${currentStepData.temperature}°C`}
                            {currentStepData.speed > 0 &&
                                ` with speed ${currentStepData.speed}`}
                            {currentStepData.duration > 0 &&
                                ` for ${currentStepData.duration} minutes`}
                        </div>
                        <p className="action-description">
                            {getActionConfig(currentStepData.actionType).description}
                        </p>
                    </div>
                </div>

                {/* Navigation controls */}
                <div className="step-controls">
                    {/* Left button: Previous or Reset */}
                    <button
                        className={`control-btn ${(stepStarted || elapsedTime > 0) && !flashNextButton ? 'reset' : 'prev'}`}
                        onClick={() => {
                        if ((stepStarted || elapsedTime > 0) && !flashNextButton) {
                            setStepStarted(false);
                            setElapsedTime(0);
                            setFlashNextButton(false);
                        } else {
                            prevStep();
                        }
                        }}
                        disabled={!stepStarted && elapsedTime === 0 && currentStep === 0}
                    >
                        {(stepStarted || elapsedTime > 0) && !flashNextButton ? '🔄 Reset' : '← Previous Step'}
                    </button>

                    {/* Middle & Right buttons or Start button */}
                    {!stepStarted && elapsedTime === 0 ? (
                        <button
                        className="control-btn start"
                        onClick={() => setStepStarted(true)}
                        >
                        ▶️ Start Step
                        </button>
                    ) : !flashNextButton ? (
                        <>
                        <button
                            className="control-btn start-stop"
                            onClick={() => setStepStarted(prev => !prev)}
                        >
                            {stepStarted ? '⏸️ Stop' : '▶️ Start'}
                        </button>
                        <button
                            className="control-btn skip"
                            onClick={() => {
                                setStepStarted(false);       
                                setElapsedTime(0);           

                                if (currentStep < totalSteps - 1) {
                                nextStep();
                                } else {
                                finishCooking();
                                }
                            }}
                        >
                            ⏭️ Skip
                        </button>
                        </>
                    ) : currentStep < totalSteps - 1 ? (
                        <button
                        className={`control-btn next pulse-glow`}
                        onClick={() => {
                            setStepStarted(false);       
                            setElapsedTime(0);   
                            nextStep();
                        }}
                        >
                        Next Step →
                        </button>
                    ) : (
                        <button
                        className={`control-btn finish pulse-glow`}
                        onClick={finishCooking}
                        >
                        🎉 Finish Cooking
                        </button>
                    )}
                    </div>


            </div>
        </div>
    );
};

export default PlayRecipePage;