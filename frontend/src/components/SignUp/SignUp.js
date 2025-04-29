import "./SignUp.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const SignUp = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !confirmPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8000/users/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            navigate("/login", {
                state: { message: "Registration successful! Please login." }
            });
        } catch (err) {
            setError(err.message || "An error occurred during registration");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-form">
            <h1>Sign Up</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>

            <label className="signUp">
                Already have an account? <Link to="/login">Log in</Link>
            </label>
        </div>
    );
};

export default SignUp;