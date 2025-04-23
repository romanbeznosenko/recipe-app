import React from "react";
import "./Step.css";

const Step = ({ stepNumber, description, temperature, speed, duration }) => {
    return (
        <div className="step-container">
            <h2 className="step-title">{stepNumber}</h2>
            <p className="step-description">{description}</p>
            <p className="step-details">
                <span className="step-info">
                    <strong>Temperature:</strong> {temperature} <br />
                    <strong>Duration:</strong> {duration} minutes <br />
                    <strong>Blade Speed:</strong> {speed}
                </span>
            </p>
        </div>
    );
};

export default Step;
