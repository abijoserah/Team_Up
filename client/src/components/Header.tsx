import { Link, NavLink } from "react-router";
import "../styles/Header.css";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { auth } = useAuth();

  return (
    <header className="header-navbar">
      <div>
        <p>Bonjour</p>
        {auth && <p>{auth.user.username}</p>}
      </div>
      <NavLink to="/">
        <img src="/logo.png" alt="logo team up" />
      </NavLink>
      {auth && (
        <Link to="/messenger" className="btn-chat">
          <img src="/icons/message.png" alt="icon message" />
        </Link>
      )}
    </header>
  );
}

export default Header;
