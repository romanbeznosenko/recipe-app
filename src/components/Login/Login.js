import "./Login.css"
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/home");
  }

  return (
      <div className="login-form">
        <h1>Login</h1>
        <input type="email" placeholder="Enter email"></input>
        <input type="password" placeholder="Enter password"></input>
        <a href="/" className="forgotPassword">
          <label>Forgot your password?</label>
        </a>

        <button onClick={handleLogin}>Sign in</button>
        <label className="signUp">Dont't have an account? <Link to="/signup">Sign up</Link></label>
      </div>
    )
}

export default Login;