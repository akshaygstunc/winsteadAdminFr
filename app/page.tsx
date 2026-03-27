"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token) {
      window.location.href = "/login";
    } else if (user.role !== "admin") {
      window.location.href = "/unauthorized";
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Dashboard</div>;
}
