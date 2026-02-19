import { Box, Button, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { muiTheme } from "../theme/muiTheme";
import { useState } from "react";
import "../styles/SignUp.css";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

type NewUser = Omit<User, "id"> & {
  confirmPassword: string;
};

function SignUp() {
  const [user, setUser] = useState<NewUser>({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstname: "",
    lastname: "",
    born_at: "",
    address: "",
    city: "",
    zip_code: "",
    phone: "",
    picture: "",
  });

  const navigate = useNavigate();
  const [error, setError] = useState({
    field: "",
    message: "",
  });

  const Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({ field: "", message: "" });
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        errorData.message && errorData.path
          ? setError({
              field: errorData.path[0],
              message: errorData.message,
            })
          : errorData.message
            ? setError((prev) => ({ ...prev, message: errorData.message }))
            : setError((prev) => ({ ...prev, message: "Erreur serveur" }));
        return;
      }
      navigate("/sign-in", {
        state: {
          from: "/sign-up",
        },
      });
      setTimeout(() => {
        toast.success("Compte créé avec succès");
      }, 50);
    } catch (error) {
      setError((prev) => ({
        ...prev,
        message: "Impossible de contacter le serveur",
      }));
    }
  };
  const ChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error.field) {
      setError({ field: "", message: "" });
    }
  };

  return (
    <div id="sign-up">
      <h1>CRÉER UN COMPTE</h1>
      <ThemeProvider theme={muiTheme}>
        <Box
          component="form"
          noValidate
          onSubmit={Submit}
          sx={{
            marginTop: "2vh",
            display: "flex",
            flexDirection: "column",
            gap: "3vh",
            width: "70%",
          }}
        >
          <div>
            <TextField
              label="Nom d'utilisateur"
              required
              variant="outlined"
              size="small"
              name="username"
              value={user.username}
              onChange={ChangeInput}
              error={error.field === "username"}
            />
            <TextField
              label="Email"
              required
              variant="outlined"
              size="small"
              name="email"
              value={user.email}
              onChange={ChangeInput}
              error={error.field === "email"}
            />
          </div>
          <div>
            <TextField
              label="Mot de passe"
              type="password"
              autoComplete="password"
              required
              variant="outlined"
              size="small"
              name="password"
              value={user.password}
              onChange={ChangeInput}
              error={error.field === "password"}
            />
            <TextField
              label="Confirmer mot de passe"
              type="password"
              autoComplete="confirmPassword"
              required
              variant="outlined"
              size="small"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={ChangeInput}
              error={error.field === "confirmPassword"}
            />
          </div>
          <p className="champs-requis">
            Min. 8 caractères : 1 maj, 1 min, 1 chiffre, 1 symbole.
          </p>
          <div>
            <TextField
              label="Prénom"
              required
              variant="outlined"
              size="small"
              name="firstname"
              value={user.firstname}
              onChange={ChangeInput}
              error={error.field === "firstname"}
            />
            <TextField
              label="Nom"
              required
              variant="outlined"
              size="small"
              name="lastname"
              value={user.lastname}
              onChange={ChangeInput}
              error={error.field === "lastname"}
            />
          </div>
          <TextField
            label="Addresse"
            required
            variant="outlined"
            size="small"
            name="address"
            value={user.address}
            onChange={ChangeInput}
            error={error.field === "address"}
          />
          <div>
            <TextField
              label="Ville"
              required
              variant="outlined"
              size="small"
              name="city"
              value={user.city}
              onChange={ChangeInput}
              error={error.field === "city"}
            />
            <TextField
              label="Code postal"
              required
              variant="outlined"
              size="small"
              name="zip_code"
              value={user.zip_code}
              onChange={ChangeInput}
              error={error.field === "zip_code"}
            />
          </div>
          <div>
            <TextField
              label="Téléphone"
              required
              variant="outlined"
              size="small"
              name="phone"
              value={user.phone}
              onChange={ChangeInput}
              error={error.field === "phone"}
            />
            <TextField
              label="Date de naissance"
              type="date"
              required
              variant="outlined"
              size="small"
              name="born_at"
              value={user.born_at}
              onChange={ChangeInput}
              slotProps={{ inputLabel: { shrink: true } }}
              error={error.field === "born_at"}
            />
          </div>
          <p className={"message-error"}>{error.message}</p>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              marginBottom: "2rem",
              fontSize: "button-mobile",
              borderRadius: "10px",
              backgroundColor: "var(--button-color)",
              "&:hover": {
                backgroundColor:
                  "color-mix(in srgb, var(--button-color) 85%, black)",
              },
            }}
          >
            Envoyer
          </Button>
        </Box>
      </ThemeProvider>
      <p className="link-to">
        Si vous êtes déjà inscrit :{" "}
        <Link to="/sign-in" state={{ from: "/sign-up" }}>
          Cliquez ici !
        </Link>
      </p>
    </div>
  );
}

export default SignUp;
