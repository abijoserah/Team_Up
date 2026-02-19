import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "../styles/SignIn.css";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function SignIn() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");

  const { setAuth } = useAuth() as {
    setAuth: (auth: Auth | null) => void;
  };

  useEffect(() => {
    if (location.state?.toast) {
      toast.success(location.state.toast);
      navigate(location.pathname, {
        replace: true,
        state: { from: location.state.from },
      });
    }
  }, [location.state, location.pathname, navigate]);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: (emailRef.current as HTMLInputElement).value,
        password: (passwordRef.current as HTMLInputElement).value,
      }),
    });

    if (response.status === 200) {
      const user = await response.json();

      setAuth(user);

      if (location.state?.from === "/sign-up") {
        navigate("/");
      } else {
        navigate(-1);
      }
      setTimeout(() => {
        toast.success("Connexion réussie");
      }, 50);
    }

    if (response.status === 422) {
      setError("Email ou mot de passe incorrect");
    }
  }

  return (
    <>
      <div className="signin-container">
        <h1>Connexion</h1>
        <form onSubmit={(e) => login(e)} className="signin-form">
          <div>
            <label htmlFor="email">Email</label>{" "}
            <input ref={emailRef} type="email" id="email" />
          </div>
          <div>
            <label htmlFor="password">Password</label>{" "}
            <input type="password" id="password" ref={passwordRef} />
          </div>
          <p>{error}</p>
          <button className="send-btn" type="submit">
            Connecter
          </button>
        </form>
        <p className="link-to">
          Si vous n'êtes pas inscrit : <Link to="/sign-up">Cliquez ici !</Link>
        </p>
      </div>
    </>
  );
}

export default SignIn;
