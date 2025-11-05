import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If user is not logged in, redirect to /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but role is not in allowedRoles, redirect to /
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If authorized, render children
  return children;
};

export default PrivateRoute;
