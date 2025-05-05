import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import RecipePage from "./pages/RecipePage/RecipePage";
import CreateRecipePage from "./pages/CreateRecipePage/CreateRecipePage";
import EditRecipePage from "./pages/EditRecipePage/EditRecipePage";
import "./App.css";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("token") !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/recipe/:recipeId" element={<RecipePage />} />
        <Route 
          path="/create-recipe" 
          element={
            <ProtectedRoute>
              <CreateRecipePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-recipe/:recipeId" 
          element={
            <ProtectedRoute>
              <EditRecipePage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;