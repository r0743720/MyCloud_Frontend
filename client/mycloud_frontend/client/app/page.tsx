import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("loggedInUser");
    user ? router.push("/dashboard") : router.push("/login");
  }, []);

  return null;
}