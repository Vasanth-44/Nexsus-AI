"use client";

import { useEffect, useState } from "react";
import { DEFAULT_USER_ID, getUserId, setUserId, USER_ID_CHANGED_EVENT } from "@/lib/storage";

export function useUserId() {
  const [userId, setUserIdState] = useState(DEFAULT_USER_ID);

  useEffect(() => {
    setUserIdState(getUserId());

    const handleUserChange = () => {
      setUserIdState(getUserId());
    };

    window.addEventListener(USER_ID_CHANGED_EVENT, handleUserChange);
    window.addEventListener("storage", handleUserChange);

    return () => {
      window.removeEventListener(USER_ID_CHANGED_EVENT, handleUserChange);
      window.removeEventListener("storage", handleUserChange);
    };
  }, []);

  const saveUserId = (nextUserId: string) => {
    setUserId(nextUserId);
    setUserIdState(getUserId());
  };

  return {
    userId,
    setUserId: saveUserId
  };
}
