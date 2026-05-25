const getToken = (): string => {
  const user = sessionStorage.getItem("loggedInUser");
  console.log("getToken called");
  return user ? JSON.parse(user).token : "";
  
};

const login = (username: string, password: string) => {
    console.log("login fetch call:", process.env.NEXT_PUBLIC_API_URL)
  return fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
};

const AuthService = { login, getToken };
export default AuthService;