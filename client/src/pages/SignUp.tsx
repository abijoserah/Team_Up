import { Box, Button, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { muiTheme } from "../theme/muiTheme";
import { useEffect, useRef, useState } from "react";
import "../styles/signUp.css";

type NewUser = Omit<User, "id"> & {
  confirmPassword: string;
};

function SignUp() {
  const [user, setUser] = useState<NewUser>({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    firstName: "",
    lastName: "",
    born_at: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    picture: "",
  });
  const [message, setMessage] = useState<string>("");
  const messageSuccess = "Compte créé avec succès !";
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [message]);
  const Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!response.ok) {
        switch (response.status) {
          case 400:
            setMessage("Données saisies invalides");
            break;
          case 409:
            setMessage("Nom d'utilisateur déjà existant");
            break;
          default:
            setMessage("Erreur serveur");
        }
        return;
      }
      setMessage(messageSuccess);
    } catch (error) {
      setMessage("Impossible de contacter le serveur");
    }
  };
  const ChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div id="sign-up">
      <h1>CÉER UN COMPTE</h1>
      <ThemeProvider theme={muiTheme}>
        <Box
          component="form"
          noValidate
          onSubmit={Submit}
          sx={{
            marginTop: "2vh",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "3vh",
          }}
        >
          <TextField
            label="Nom d'utilisateur"
            required
            variant="outlined"
            size="small"
            name="username"
            value={user.username}
            onChange={ChangeInput}
          />
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
          />
          <TextField
            label="Confirme mot de passe"
            type="password"
            autoComplete="confirmPassword"
            required
            variant="outlined"
            size="small"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={ChangeInput}
          />
          <TextField
            label="Email"
            required
            variant="outlined"
            size="small"
            name="email"
            value={user.email}
            onChange={ChangeInput}
          />
          <TextField
            label="Prénom"
            required
            variant="outlined"
            size="small"
            name="firstName"
            value={user.firstName}
            onChange={ChangeInput}
          />
          <TextField
            label="Nom"
            required
            variant="outlined"
            size="small"
            name="lastName"
            value={user.lastName}
            onChange={ChangeInput}
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
          />
          <TextField
            label="Address"
            required
            variant="outlined"
            size="small"
            name="address"
            value={user.address}
            onChange={ChangeInput}
          />
          <TextField
            label="Ville"
            required
            variant="outlined"
            size="small"
            name="city"
            value={user.city}
            onChange={ChangeInput}
          />
          <TextField
            label="Code postal"
            required
            variant="outlined"
            size="small"
            name="zipCode"
            value={user.zipCode}
            onChange={ChangeInput}
          />
          <TextField
            label="Téléphone"
            required
            variant="outlined"
            size="small"
            name="phone"
            value={user.phone}
            onChange={ChangeInput}
          />
          <TextField
            label="URL photo"
            variant="outlined"
            size="small"
            name="picture"
            value={user.picture}
            onChange={ChangeInput}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{
              fontSize: "button-mobile",
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
      <p
        ref={messageRef}
        className={
          message === messageSuccess ? "message-success" : "message-error"
        }
      >
        {message}
      </p>
    </div>
  );
}

export default SignUp;
