import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../styles/variables.css";
import "../styles/ActivityForm.css";
import { useMediaQuery } from "react-responsive";
import ActivityCard from "../components/ActivityCard";
import { StatusCodes } from "http-status-codes";
import toast from "react-hot-toast";

const LIMIT = 6;

function ActivityForm() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportId, setSportId] = useState("");
  const [sportSearch, setSportSearch] = useState("");
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);
  const sportsDropdownRef = useRef<HTMLDivElement>(null);
  const criteriaModalRef = useRef<HTMLDialogElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const zipCodeRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const [playingAt, setPlayingAt] = useState("");
  const [playingTime, setPlayingTime] = useState("");
  const playingDurationRef = useRef<HTMLInputElement>(null);
  const nbPlacesRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [autoValidation, setAutoValidation] = useState(false);
  const [locker, setLocker] = useState(false);
  const [shower, setShower] = useState(false);
  const [toilet, setToilet] = useState(false);
  const [airConditioning, setAirConditioning] = useState(false);
  const [level, setLevel] = useState<
    "beginner" | "amateur" | "advanced" | "all"
  >("all");
  const [handisport, setHandisport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestInput, setGuestInput] = useState<string>("");
  const [guests, setGuests] = useState<User[]>([]);
  const [openTooltipStatut, setOpenTooltipStatut] = useState(false);
  const [error, setError] = useState({ addGuest: "", addActivity: "" });
  const [activities, setActivities] = useState<Activity[]>([]);

  const isMobile = useMediaQuery({ query: "(max-width: 1439px)" });

  const { auth } = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/sports`)
      .then((res) => res.json())
      .then((sports) => setSports(sports))
      .catch(() =>
        setError((prev) => ({
          ...prev,
          addActivity: "Impossible de charger les sports",
        })),
      );
  }, []);

  useEffect(() => {
    const hideSportsDropdown = (e: MouseEvent) => {
      if (
        sportsDropdownRef.current &&
        !sportsDropdownRef.current.contains(e.target as Node)
      ) {
        setShowSportsDropdown(false);
      }
    };
    document.addEventListener("mousedown", hideSportsDropdown);
    return () => document.removeEventListener("mousedown", hideSportsDropdown);
  }, []);

  const filteredSports = sports.filter((sport) =>
    sport.name.toLowerCase().includes(sportSearch.toLowerCase()),
  );

  const selectSport = (sport: Sport) => {
    setSportId(String(sport.id));
    setSportSearch(sport.name);
    setShowSportsDropdown(false);
  };

  const openCriteriaModal = () => {
    criteriaModalRef.current?.showModal();
  };

  const closeCriteriaModal = () => {
    criteriaModalRef.current?.close();
  };

  const createActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError((prev) => ({ ...prev, addActivity: "" }));
    setIsSubmitting(true);

    const activityData = {
      activity: {
        user_id: auth?.user.id,
        sport_id: Number(sportId),
        address: addressRef.current?.value || "",
        city: cityRef.current?.value || "",
        zip_code: zipCodeRef.current?.value || "",
        playing_at: playingAt,
        playing_time: playingTime,
        playing_duration: Number(playingDurationRef.current?.value) || 0,
        nb_spots: Number(nbPlacesRef.current?.value) || 0,
        description: descriptionRef.current?.value || null,
        price: isFree ? 0 : Number(price),
        visibility: isPublic,
        auto_validation: isPublic ? autoValidation : false,
        level: level,
        locker: locker,
        shower: shower,
        toilet: toilet,
        air_conditioning: airConditioning,
      },
      guests,
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/activities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify(activityData),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la publication");
      }

      navigate("/my-activities", {
        state: {
          selectedTab: "published",
        },
      });

      setTimeout(() => {
        toast.success("Activité créée avec succès");
      }, 50);
    } catch (err) {
      setError((prev) => ({
        ...prev,
        addActivity: err instanceof Error ? err.message : "Erreur inconnue",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGuest = async () => {
    setError((prev) => ({ ...prev, addActivity: "" }));
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?email=${guestInput}`,
      );

      if (response.status === StatusCodes.OK) {
        const user = await response.json();

        if (!guests.some((guest) => guest.id === user.id)) {
          setGuests((prev) => [...prev, user]);
          setGuestInput("");
          setError((prev) => ({ ...prev, addGuest: "" }));
        } else {
          setError((prev) => ({ ...prev, addGuest: "Déjà invité" }));
        }
      } else if (response.status === StatusCodes.NO_CONTENT) {
        setError((prev) => ({
          ...prev,
          addGuest: "Veuillez remplir le champ",
        }));
      } else if (response.status === StatusCodes.NOT_FOUND) {
        setError((prev) => ({ ...prev, addGuest: "Email inexistant" }));
      } else {
        setError((prev) => ({ ...prev, addGuest: "Erreur serveur" }));
      }
    } catch {
      setError((prev) => ({ ...prev, addGuest: "Erreur inconnue" }));
    }
  };

  const removeGuest = (guest: User) => {
    setGuests((prev) => prev.filter((g) => g.id !== guest.id));
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/activities?limit=${LIMIT}`, {
      method: "GET",
      headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
    })
      .then((response) => response.json())
      .then((activities) => setActivities(activities.activities));
  }, [auth]);

  return (
    <section className="publication-page">
      <div className="form-container">
        <h1>Publier une annonce</h1>
        <p className="required-fields">*Champs obligatoires</p>

        <form className="publication-form" onSubmit={createActivity}>
          <div className="combobox" ref={sportsDropdownRef}>
            <div className="input-with-icon">
              <img
                src="./icons/search-input.svg"
                alt=""
                width="24"
                height="24"
              />
              <input
                type="text"
                placeholder="Sport *"
                value={sportSearch}
                onChange={(e) => {
                  setSportSearch(e.target.value);
                  setSportId("");
                  setShowSportsDropdown(true);
                }}
                onFocus={() => setShowSportsDropdown(true)}
                required={!sportId}
              />
            </div>
            {showSportsDropdown && filteredSports.length > 0 && (
              <ul className="combobox-dropdown">
                {filteredSports.slice(0, 250).map((sport) => (
                  <li key={sport.id}>
                    <button type="button" onClick={() => selectSport(sport)}>
                      {sport.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <input type="hidden" name="sportId" value={sportId} />
          </div>

          <div className="input-with-icon">
            <img src="./icons/pin-input.svg" alt="" width="24" height="24" />
            <input
              type="text"
              placeholder="Adresse *"
              ref={addressRef}
              required
            />
          </div>

          <div className="field-row">
            <div className="input-with-icon">
              <img src="./icons/pin-input.svg" alt="" width="24" height="24" />
              <input
                type="text"
                placeholder="Code postal *"
                ref={zipCodeRef}
                required
              />
            </div>

            <div className="input-with-icon">
              <img src="./icons/pin-input.svg" alt="" width="24" height="24" />
              <input type="text" placeholder="Ville *" ref={cityRef} required />
            </div>
          </div>

          <div className="field-row field-row-3">
            <div className="input-with-icon date-input-wrapper">
              <img
                src="./icons/calendar-input.svg"
                alt=""
                width="24"
                height="24"
              />
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={playingAt}
                onChange={(e) => setPlayingAt(e.target.value)}
                required
              />
              {!playingAt && <span className="date-placeholder">Date *</span>}
            </div>

            <div className="input-with-icon time-input-wrapper">
              <img
                src="./icons/clock-input.svg"
                alt=""
                width="24"
                height="24"
              />
              <input
                type="time"
                value={playingTime}
                onChange={(e) => setPlayingTime(e.target.value)}
                required
              />
              {!playingTime && (
                <span className="time-placeholder">Heure *</span>
              )}
            </div>

            <div className="input-with-icon">
              <img
                src="./icons/duration-input.svg"
                alt=""
                width="24"
                height="24"
              />
              <input
                type="number"
                placeholder="Durée (min) *"
                ref={playingDurationRef}
                required
                min="1"
              />
            </div>
          </div>

          <div className="places-budget-description-row">
            <div className="places-budget-column">
              <div className="input-with-icon">
                <img
                  src="./icons/participants-input.svg"
                  alt=""
                  width="24"
                  height="24"
                />
                <input
                  type="number"
                  placeholder="Nombre de places *"
                  ref={nbPlacesRef}
                  required
                  min="1"
                />
              </div>

              <div className="budget-row">
                <span className="budget-label">Budget * :</span>
                <div className="radio-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="pricing"
                      checked={isFree}
                      onChange={() => setIsFree(true)}
                    />
                    Gratuit
                  </label>

                  <label className="radio-label">
                    <input
                      type="radio"
                      name="pricing"
                      checked={!isFree}
                      onChange={() => setIsFree(false)}
                    />
                    Payant
                  </label>
                </div>

                <div
                  className={`price-input-wrapper ${isFree ? "disabled" : ""}`}
                >
                  <img
                    src="./icons/price-input.svg"
                    alt=""
                    width="20"
                    height="20"
                  />
                  <input
                    type="number"
                    placeholder="Prix (€)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    disabled={isFree}
                    required={!isFree}
                  />
                </div>
              </div>
            </div>

            <textarea
              placeholder="Description ..."
              ref={descriptionRef}
              rows={4}
            />
          </div>

          {(locker ||
            shower ||
            toilet ||
            airConditioning ||
            level !== "all" ||
            handisport) && (
            <div className="criteria-tags">
              {level !== "all" && (
                <span className="criteria-tag">
                  {level === "beginner"
                    ? "Débutant"
                    : level === "amateur"
                      ? "Intermédiaire"
                      : "Confirmé"}
                  <button type="button" onClick={() => setLevel("all")}>
                    ✕
                  </button>
                </span>
              )}
              {locker && (
                <span className="criteria-tag">
                  Vestiaires
                  <button type="button" onClick={() => setLocker(false)}>
                    ✕
                  </button>
                </span>
              )}
              {shower && (
                <span className="criteria-tag">
                  Douches
                  <button type="button" onClick={() => setShower(false)}>
                    ✕
                  </button>
                </span>
              )}
              {toilet && (
                <span className="criteria-tag">
                  Toilettes
                  <button type="button" onClick={() => setToilet(false)}>
                    ✕
                  </button>
                </span>
              )}
              {airConditioning && (
                <span className="criteria-tag">
                  Climatisation
                  <button
                    type="button"
                    onClick={() => setAirConditioning(false)}
                  >
                    ✕
                  </button>
                </span>
              )}
              {handisport && (
                <span className="criteria-tag">
                  Handisport
                  <button type="button" onClick={() => setHandisport(false)}>
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}

          <button
            type="button"
            className="btn-criteria"
            onClick={openCriteriaModal}
          >
            Ajouter des critères
          </button>

          <section className="criteria-desktop">
            <header className="criteria-desktop-header">
              <h3>Critères supplémentaires</h3>
              <button
                type="button"
                onClick={() => {
                  setLocker(false);
                  setShower(false);
                  setToilet(false);
                  setAirConditioning(false);
                  setLevel("all");
                  setHandisport(false);
                }}
              >
                Effacer filtres
              </button>
            </header>
            <div className="criteria-desktop-columns">
              <fieldset className="criteria-desktop-column">
                <legend>Équipements</legend>
                <label>
                  Vestiaires
                  <input
                    type="checkbox"
                    checked={locker}
                    onChange={(e) => setLocker(e.target.checked)}
                  />
                </label>
                <label>
                  Douches
                  <input
                    type="checkbox"
                    checked={shower}
                    onChange={(e) => setShower(e.target.checked)}
                  />
                </label>
                <label>
                  Toilettes
                  <input
                    type="checkbox"
                    checked={toilet}
                    onChange={(e) => setToilet(e.target.checked)}
                  />
                </label>
                <label>
                  Climatisation
                  <input
                    type="checkbox"
                    checked={airConditioning}
                    onChange={(e) => setAirConditioning(e.target.checked)}
                  />
                </label>
              </fieldset>
              <fieldset className="criteria-desktop-column">
                <legend>Niveau</legend>
                <label>
                  Tout niveau
                  <input
                    type="radio"
                    name="levelDesktop"
                    checked={level === "all"}
                    onChange={() => setLevel("all")}
                  />
                </label>
                <label>
                  Débutant
                  <input
                    type="radio"
                    name="levelDesktop"
                    checked={level === "beginner"}
                    onChange={() => setLevel("beginner")}
                  />
                </label>
                <label>
                  Intermédiaire
                  <input
                    type="radio"
                    name="levelDesktop"
                    checked={level === "amateur"}
                    onChange={() => setLevel("amateur")}
                  />
                </label>
                <label>
                  Confirmé
                  <input
                    type="radio"
                    name="levelDesktop"
                    checked={level === "advanced"}
                    onChange={() => setLevel("advanced")}
                  />
                </label>
              </fieldset>
              <fieldset className="criteria-desktop-column">
                <legend>Type de sport</legend>
                <label>
                  Handisport
                  <input
                    type="checkbox"
                    checked={handisport}
                    onChange={(e) => setHandisport(e.target.checked)}
                  />
                </label>
              </fieldset>
            </div>
          </section>

          <div className="status-row">
            <div className="status-box">
              <span className="status-label tooltip">
                <button
                  type="button"
                  className="btn-info"
                  onClick={() => {
                    setOpenTooltipStatut((prev) => !prev);
                  }}
                >
                  <img
                    src="./icons/info.png"
                    alt="bulle info"
                    width="12"
                    height="12"
                  />
                </button>
                Statut * :
              </span>

              <label className="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                />
                Public
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                />
                Privée
              </label>
            </div>
            {openTooltipStatut && (
              <p className="text-tooltip-status">
                Public = tous les utilisateurs de l'app peuvent voir et
                s'inscrirent à votre activité
                <br />
                <br />
                Privée = seul les personnes que vous invitez peuvent voir et
                participer à votre activité
              </p>
            )}

            {isPublic && (
              <div className="status-box">
                <span className="status-label">
                  Réservation automatique * :
                </span>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="autoValidation"
                    checked={autoValidation}
                    onChange={() => setAutoValidation(true)}
                  />
                  Oui
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="autoValidation"
                    checked={!autoValidation}
                    onChange={() => setAutoValidation(false)}
                  />
                  Non
                </label>
              </div>
            )}

            {!isPublic && (
              <div className="guests-section">
                {guests.map((guest) => (
                  <div key={guest.id} className="guest-row added-guest">
                    <div className="guest-input-display">
                      <svg
                        className="username-accepted"
                        width="22"
                        height="22"
                        viewBox="0 0 32 32"
                      >
                        <title>icon profile</title>
                        <g id="about">
                          <path d="M16,16A7,7,0,1,0,9,9,7,7,0,0,0,16,16ZM16,4a5,5,0,1,1-5,5A5,5,0,0,1,16,4Z" />

                          <path d="M17,18H15A11,11,0,0,0,4,29a1,1,0,0,0,1,1H27a1,1,0,0,0,1-1A11,11,0,0,0,17,18ZM6.06,28A9,9,0,0,1,15,20h2a9,9,0,0,1,8.94,8Z" />
                        </g>
                      </svg>
                      <span>{guest.email}</span>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-guest"
                      onClick={() => removeGuest(guest)}
                      aria-label={`Retirer ${guest}`}
                    >
                      <img
                        src="./icons/remove.png"
                        alt=""
                        width="20"
                        height="20"
                      />
                    </button>
                  </div>
                ))}

                <div className="guest-row">
                  <div
                    className={`guest-input-display ${error.addGuest && "error-detected"}`}
                  >
                    <svg
                      className={`username-accepted ${error.addGuest && "username-refused"}`}
                      width="22"
                      height="22"
                      viewBox="0 0 32 32"
                    >
                      <title>icon profile</title>
                      <g id="about">
                        <path d="M16,16A7,7,0,1,0,9,9,7,7,0,0,0,16,16ZM16,4a5,5,0,1,1-5,5A5,5,0,0,1,16,4Z" />

                        <path d="M17,18H15A11,11,0,0,0,4,29a1,1,0,0,0,1,1H27a1,1,0,0,0,1-1A11,11,0,0,0,17,18ZM6.06,28A9,9,0,0,1,15,20h2a9,9,0,0,1,8.94,8Z" />
                      </g>
                    </svg>
                    <input
                      type="text"
                      value={guestInput}
                      onFocus={() =>
                        setError((prev) => ({ ...prev, addGuest: "" }))
                      }
                      onChange={(e) => {
                        setGuestInput(e.target.value);
                        setError((prev) => ({ ...prev, addActivity: "" }));
                      }}
                      placeholder="Inviter des personnes (email)"
                    />
                    {error.addGuest && (
                      <p className="error-message-add-guest">
                        {error.addGuest}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-add-guest"
                    onClick={addGuest}
                    aria-label="Ajouter une personne"
                  >
                    <img src="./icons/add.png" alt="" width="20" height="20" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {error.addActivity && (
            <p className="error-message">{error.addActivity}</p>
          )}

          <button type="submit" className="btn-publish" disabled={isSubmitting}>
            {isSubmitting ? "Publication..." : "Publier"}
          </button>
        </form>

        <dialog
          className="modal-criteria"
          ref={criteriaModalRef}
          onClick={(e) =>
            e.target === criteriaModalRef.current && closeCriteriaModal()
          }
          onKeyDown={(e) => e.key === "Escape" && closeCriteriaModal()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="modal-close"
                onClick={closeCriteriaModal}
              >
                ✕
              </button>
              <button
                type="button"
                className="modal-clear"
                onClick={() => {
                  setLocker(false);
                  setShower(false);
                  setToilet(false);
                  setAirConditioning(false);
                  setLevel("all");
                  setHandisport(false);
                }}
              >
                Tout effacer
              </button>
            </div>

            <fieldset className="criteria-fieldset">
              <legend>Équipements</legend>
              <div className="criteria-group">
                <label className="criteria-label">
                  Vestiaires
                  <input
                    type="checkbox"
                    checked={locker}
                    onChange={(e) => setLocker(e.target.checked)}
                  />
                </label>
                <label className="criteria-label">
                  Douches
                  <input
                    type="checkbox"
                    checked={shower}
                    onChange={(e) => setShower(e.target.checked)}
                  />
                </label>
                <label className="criteria-label">
                  Toilettes
                  <input
                    type="checkbox"
                    checked={toilet}
                    onChange={(e) => setToilet(e.target.checked)}
                  />
                </label>
                <label className="criteria-label">
                  Climatisation
                  <input
                    type="checkbox"
                    checked={airConditioning}
                    onChange={(e) => setAirConditioning(e.target.checked)}
                  />
                </label>
              </div>
            </fieldset>

            <hr className="criteria-divider" />

            <fieldset className="criteria-fieldset">
              <legend>Niveau</legend>
              <div className="criteria-group">
                <label className="criteria-label">
                  Tout niveau
                  <input
                    type="radio"
                    name="level"
                    checked={level === "all"}
                    onChange={() => setLevel("all")}
                  />
                </label>
                <label className="criteria-label">
                  Débutant
                  <input
                    type="radio"
                    name="level"
                    checked={level === "beginner"}
                    onChange={() => setLevel("beginner")}
                  />
                </label>
                <label className="criteria-label">
                  Intermédiaire
                  <input
                    type="radio"
                    name="level"
                    checked={level === "amateur"}
                    onChange={() => setLevel("amateur")}
                  />
                </label>
                <label className="criteria-label">
                  Confirmé
                  <input
                    type="radio"
                    name="level"
                    checked={level === "advanced"}
                    onChange={() => setLevel("advanced")}
                  />
                </label>
              </div>
            </fieldset>

            <hr className="criteria-divider" />

            <fieldset className="criteria-fieldset">
              <legend>Type de sport</legend>
              <div className="criteria-group">
                <label className="criteria-label">
                  Handisport
                  <input
                    type="checkbox"
                    checked={handisport}
                    onChange={(e) => setHandisport(e.target.checked)}
                  />
                </label>
              </div>
            </fieldset>

            <button
              type="button"
              className="btn-validate"
              onClick={closeCriteriaModal}
            >
              Valider
            </button>
          </div>
        </dialog>
      </div>

      {!isMobile && <div className="seperation"> </div>}

      {!isMobile && (
        <div className="activities-container-page-publication">
          <p className="recently-activities">Annonces récemment publiées</p>
          <div className="activities-page-publication">
            {activities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ActivityForm;
