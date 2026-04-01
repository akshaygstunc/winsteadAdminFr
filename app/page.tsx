/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!token) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/unauthorized");
    } else {
      setLoading(false);
      router.push("/dashboard");
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>Dashboard</div>;
}
