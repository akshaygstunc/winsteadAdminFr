"use client";

import useUser from "@/hooks/useUser";

export default function Protected({ children, roles }: any) {
  const user = useUser();

  if (!roles.includes(user.role)) {
    return (
      <div className="p-6 text-red-400">
        Access Denied
      </div>
    );
  }

  return children;
}