import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage/LoginPage"
import SignUpPage from "./pages/SignUpPage/SignUpPage"
import HomePage from "./pages/HomePage/HomePage"
import RecipePage from "./pages/RecipePage/RecipePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="/signup" element={<SignUpPage/>} />
        <Route path="/home" element={<HomePage/>}/>
        <Route path="/recipe/:recipeId" element={<RecipePage/>}/>
      </Routes>
    </Router>
  )
}

export default App;
