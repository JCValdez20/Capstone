// src/components/AuthInitializer.jsx
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthInitializer = ({ children }) => {
  const { refresh } = useAuth();

  useEffect(() => {
    // refresh will set user state and set isLoading false
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While refresh is in progress, you want the children to render
  // only after isLoading is false. But the individual Protected Routes
  // also handle isLoading to show loading skeletons. So we simply
  // render children now. Alternatively you can block until !isLoading.
  return <>{children}</>;
};

export default AuthInitializer;
