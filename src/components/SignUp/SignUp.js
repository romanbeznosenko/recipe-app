import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css"

const SignUp = () => {
    const navigate = useNavigate();

    const handleSignUp = () => {
        navigate("/");
    }
    return (
        <div className="signup-form">
            <h1>Create an account</h1>
            <label className="login">
                Already have an account? <Link to="/">Log in</Link>
            </label>
            <input type="text" placeholder="First Name"></input>
            <input type="text" placeholder="Last Name"></input>
            <input type="email" placeholder="Email"></input>
            <input type="password" placeholder="Enter your password"></input>
            <input type="password" placeholder="Confirm your password"></input>
            <button onClick={handleSignUp}>Create account</button>
        </div>
    );
}

export default SignUp;