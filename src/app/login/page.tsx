"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("USER =", u);
      setUser(u);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Firebase Test</h1>

      {user ? (
        <>
          <p>Logged In</p>
          <p>{user.email}</p>
          <p>{user.displayName}</p>
        </>
      ) : (
        <p>Not Logged In</p>
      )}
    </div>
  );
}
