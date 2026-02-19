import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../styles/Profile.css";

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function formatBirthDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Profile() {
  const { auth } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!auth) return;

    fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
      .then((response) => response.json())
      .then((profile) => setUserProfile(profile));
  }, [auth]);

  if (!auth) {
    return <Navigate to="/sign-in" replace />;
  }

  if (!userProfile) {
    return <p>Chargement...</p>;
  }

  const fullAddress = `${userProfile.address}, ${userProfile.zip_code}, ${userProfile.city}`;

  return (
    <section className="profile-page">
      <h1>Profil</h1>

      <article className="profile-card">
        <header className="profile-header">
          <figure className="profile-avatar">
            {userProfile.picture ? (
              <img src={userProfile.picture} alt={userProfile.username} />
            ) : (
              <span>{userProfile.username.charAt(0).toUpperCase()}</span>
            )}
          </figure>
          <div className="profile-identity">
            <h2 className="profile-username">{userProfile.username}</h2>
            <p className="profile-age">
              {calculateAge(userProfile.born_at)} ans
            </p>
          </div>
        </header>

        <section className="profile-rating">
          <img src="/icons/star.png" alt="Avis" className="profile-icon" />
          <span>5/5 - 9 avis</span>
          <img
            src="/icons/voir-plus.png"
            alt="Voir les avis"
            className="profile-chevron"
          />
        </section>

        <hr className="profile-separator" />

        <ul className="profile-info-list">
          <li className="profile-info-row">
            <img src="/icons/mail.png" alt="Email" className="profile-icon" />
            <a
              href={`mailto:${userProfile.email}`}
              className="profile-email-link"
            >
              {userProfile.email}
            </a>
          </li>
          <li className="profile-info-row">
            <img
              src="/icons/phone.png"
              alt="Téléphone"
              className="profile-icon"
            />
            <span>{userProfile.phone}</span>
          </li>
          <li className="profile-info-row">
            <img
              src="/icons/localisation.png"
              alt="Adresse"
              className="profile-icon"
            />
            <span>{fullAddress}</span>
          </li>
          <li className="profile-info-row">
            <img
              src="/icons/anniversaire.png"
              alt="Date de naissance"
              className="profile-icon"
            />
            <span>{formatBirthDate(userProfile.born_at)}</span>
          </li>
        </ul>

        <hr className="profile-separator" />

        <ul className="profile-info-list">
          <li className="profile-info-row">
            <img
              src="/icons/sport-pref.png"
              alt="Sport favori"
              className="profile-icon"
            />
            <span>Non renseigné</span>
          </li>
          <li className="profile-info-row">
            <img
              src="/icons/mains.png"
              alt="Membre depuis"
              className="profile-icon"
            />
            <span>Membre depuis 2026</span>
          </li>
        </ul>

        <hr className="profile-separator" />

        <ul className="profile-action-list">
          <li className="profile-action-row">
            <img
              src="/icons/cadena.png"
              alt="Mot de passe"
              className="profile-icon"
            />
            <span>Changer mot de passe</span>
            <img
              src="/icons/voir-plus.png"
              alt="Aller"
              className="profile-chevron"
            />
          </li>
          <li className="profile-action-row">
            <img
              src="/icons/desactive.png"
              alt="Désactiver"
              className="profile-icon"
            />
            <span>Désactiver mon compte</span>
            <img
              src="/icons/voir-plus.png"
              alt="Aller"
              className="profile-chevron"
            />
          </li>
          <li className="profile-action-row">
            <img
              src="/icons/supprime.png"
              alt="Supprimer"
              className="profile-icon"
            />
            <span>Supprimer mon compte</span>
            <img
              src="/icons/voir-plus.png"
              alt="Aller"
              className="profile-chevron"
            />
          </li>
        </ul>
      </article>

      <button type="button" className="profile-edit-button">
        Modifier
      </button>
    </section>
  );
}

export default Profile;
