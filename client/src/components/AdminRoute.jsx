import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import LoadingScreen from "./ui/LoadingScreen.jsx";

export default function AdminRoute({ children }) {
  const { booting, user } = useAuth();
  if (booting) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

