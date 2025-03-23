import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { MainApp } from "./components/MainApp";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-texture bg-green-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={<MainApp />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
