"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ basic validation
      if (!form.email || !form.password) {
        setError("Email and password are required");
        return;
      }

      const res = await loginAdmin(form);

      // ✅ Save token
      localStorage.setItem("token", res.access_token);

      // ✅ Save user
      localStorage.setItem("user", JSON.stringify(res.user));

      // ✅ ROLE CHECK (VERY IMPORTANT)
      if (res.user.role !== "admin" && res.user.role !== "subadmin") {
        setError("You are not authorized as admin");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return;
      }

      // ✅ Redirect (NO reload)
      router.push("/");

    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="bg-[#111] p-6 rounded-xl w-full max-w-sm space-y-4"
      >
        <h2 className="text-xl font-semibold">Admin Login</h2>

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Email */}
        <input
          placeholder="Email"
          value={form.email}
          className="w-full px-3 py-2 rounded bg-black border border-gray-700"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* Password */}
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          className="w-full px-3 py-2 rounded bg-black border border-gray-700"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-yellow-500 text-black"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}