"use client";

import { useState } from "react";

export const useAuth = () => {
  const [user] = useState({ name: "Alim" });

  return { user };
};
