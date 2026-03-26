export const loginService = async (email: string, password: string) => {
  // mock auth (later replace with API)
  if (email === "admin@mail.com") {
    return {
      name: "Admin",
      role: "admin",
      token: "fake-jwt-token",
    };
  }

  return {
    name: "Manager",
    role: "manager",
    token: "fake-jwt-token",
  };
};