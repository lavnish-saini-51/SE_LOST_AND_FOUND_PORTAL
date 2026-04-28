import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";
import LoadingScreen from "./ui/LoadingScreen.jsx";

export default function ProtectedRoute({ children }) {
  const { booting, isAuthed } = useAuth();
  const loc = useLocation();

  if (booting) return <LoadingScreen />;
  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

