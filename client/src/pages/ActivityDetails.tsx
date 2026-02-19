import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { StatusCodes } from "http-status-codes";
import "../styles/ActivityCard.css";
import "../styles/ActivityDetails.css";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

function ActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [reservationStatus, setReservationStatus] = useState<
    "idle" | "loading" | "already"
  >("idle");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const mapModalRef = useRef<HTMLDialogElement>(null);
  const openMapModal = () => mapModalRef.current?.showModal();
  const closeMapModal = () => mapModalRef.current?.close();

  const { auth } = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/activities/${id}`)
      .then((response) => response.json())
      .then((activity) => setActivity(activity));

    fetch(`${import.meta.env.VITE_API_URL}/api/participants?id=${id}`)
      .then((response) => response.json())
      .then((participants) => setParticipants(participants));
  }, [id]);

  useEffect(() => {
    if (!auth || !participants.length) return;

    const isParticipant = participants.find(
      (participant) => participant.userId === auth.user.id,
    );

    if (isParticipant?.status === "accepted") {
      setReservationStatus("already");
    }
  }, [participants, auth]);

  if (!activity) {
    return <p>Chargement...</p>;
  }

  const price = Number(activity.price);
  const playingAt = new Date(activity.playing_at);
  const formattedDate = playingAt.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const startTime = activity.playing_time.slice(0, 5).replace(":", "h");
  const startHour = Number(activity.playing_time.slice(0, 2));
  const startMinutes = Number(activity.playing_time.slice(3, 5));
  const endTotalMinutes =
    startHour * 60 + startMinutes + activity.playing_duration;
  const endHour = Math.floor(endTotalMinutes / 60);
  const endMinutes = endTotalMinutes % 60;
  const endTime = `${endHour}h${endMinutes > 0 ? endMinutes.toString().padStart(2, "0") : ""}`;
  const durationHours = Math.floor(activity.playing_duration / 60);
  const durationMinutes = activity.playing_duration % 60;
  const durationLabel =
    durationHours > 0
      ? `${durationHours}h${durationMinutes > 0 ? durationMinutes.toString().padStart(2, "0") : ""}`
      : `${durationMinutes}min`;

  const acceptedParticipants = participants.filter(
    (participant) => participant.status === "accepted",
  );

  const nbAvailableSpots = activity.nb_spots - activity.nb_participant;
  const widthProgressBar = (100 / activity.nb_spots) * activity.nb_participant;

  const mapQuery = encodeURIComponent(
    `${activity.address} ${activity.zip_code} ${activity.city}`,
  );
  const mapEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${mapQuery}`;

  function goBack() {
    navigate(-1);
  }

  function getInitial(username: string) {
    return username.charAt(0).toUpperCase();
  }

  const makeReservation = async (
    activity: Activity,
    nbAvailableSpots: number,
  ) => {
    if (!auth?.user) {
      navigate("/sign-in");
      return;
    }

    if (nbAvailableSpots <= 0 || reservationStatus !== "idle") return;
    setReservationStatus("loading");

    const newParticipant = {
      userId: auth.user.id,
      activityId: activity.id,
      status: activity.auto_validation ? "accepted" : "request",
    };

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(newParticipant),
        },
      );

      if (response.status === StatusCodes.CONFLICT) {
        setReservationStatus("already");
        return;
      }

      if (!response.ok) throw new Error("Failed to join activity");

      navigate("/my-activities", {
        state: {
          selectedTab: activity.auto_validation ? "incoming" : "pending",
        },
      });

      setTimeout(() => {
        activity.auto_validation
          ? toast.success("Vous avez bien réservé votre place")
          : toast.success("Votre demande réservation a bien été envoyée");
      }, 50);
    } catch (err) {
      console.error(err);
      setReservationStatus("idle");
    }
  };

  return (
    <section className="activity-details">
      <button type="button" className="back-button" onClick={goBack}>
        <img src="/icons/arrow-left.png" alt="" />
        Retour
      </button>

      <h1>Détails de l'activité</h1>

      <header className={`activity-image ${activity.name}`}>
        <div className="image-overlay" />
        <section className="image-content">
          <h2>{activity.name}</h2>
          <p className={`price-tag-card ${price === 0 ? "free" : "paid"}`}>
            {price === 0 ? "Gratuit" : `${price}€`}
          </p>
        </section>
      </header>

      <section className="activity-schedule">
        <p className="activity-date">
          <img src="/icons/calendar.png" alt="" />
          {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
        </p>
        <div className="activity-time">
          <img src="/icons/clock.png" alt="" />
          <span>{startTime}</span>
          <div className="duration-bar">
            <span className="duration-label">{durationLabel}</span>
          </div>
          <span>{endTime}</span>
        </div>
      </section>

      <section className="activity-location">
        <div className="address-info">
          <img src="/icons/pin.png" alt="" />
          <div>
            <p>Adresse</p>
            <p>
              {activity.address} {activity.zip_code} {activity.city}
            </p>
          </div>
        </div>
        <button type="button" className="map-link" onClick={openMapModal}>
          Voir Carte
        </button>
      </section>

      <dialog
        className="map-modal"
        ref={mapModalRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMapModal();
        }}
        onKeyDown={(e) => e.key === "Escape" && closeMapModal()}
      >
        <div className="map-modal-content">
          <div className="map-modal-header">
            <h3>Localisation</h3>
            <button
              type="button"
              className="map-modal-close"
              onClick={closeMapModal}
            >
              &times;
            </button>
          </div>
          <p className="map-modal-address">
            <img src="/icons/pin.png" alt="" />
            {activity.address} {activity.zip_code} {activity.city}
          </p>
          <div className="map-iframe-container">
            <iframe
              title="Google Maps"
              src={mapEmbedUrl}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </dialog>

      <section
        className={`spots-bar ${activity.nb_participant / activity.nb_spots >= 0.5 ? "filled" : ""}`}
      >
        <div
          className={`spots-bar-fill ${activity.nb_participant >= activity.nb_spots / 2 && "almost-full"} ${nbAvailableSpots === 0 && "full"}`}
          style={{ "--size": `${widthProgressBar}%` } as React.CSSProperties}
        />
        <p className={`${nbAvailableSpots === 0 && "full"}`}>
          {nbAvailableSpots}{" "}
          {nbAvailableSpots <= 1 ? "place restante" : "places restantes"} /{" "}
          {activity.nb_spots}
        </p>
      </section>

      <section className="good-to-know">
        <h3>Bon à savoir</h3>
        <div className="tags-container">
          {{
            all: "Tous niveaux",
            beginner: "Débutant",
            amateur: "Intermédiaire",
            advanced: "Confirmé",
          }[activity.level] && (
            <p className="tag level-tag">
              {
                {
                  all: "Tous niveaux",
                  beginner: "Débutant",
                  amateur: "Intermédiaire",
                  advanced: "Confirmé",
                }[activity.level]
              }
            </p>
          )}
          {!!activity.toilet && (
            <p className="tag">
              <img src="/icons/toilet.png" alt="" />
              Toilettes
            </p>
          )}
          {!!activity.shower && (
            <p className="tag">
              <img src="/icons/shower.png" alt="" />
              Douches
            </p>
          )}
          {!!activity.locker && (
            <p className="tag">
              <img src="/icons/locker.png" alt="" />
              Vestiaires
            </p>
          )}
          {!!activity.disabled && (
            <p className="tag">
              <img src="/icons/disabled.png" alt="" />
              Handisport
            </p>
          )}
          {!!activity.air_conditioning && (
            <p className="tag">
              <img src="/icons/air-conditionning.png" alt="" />
              Clim
            </p>
          )}
        </div>
      </section>

      <section className="activity-description">
        <h3>Description</h3>
        <div className="description-box">
          <p>{activity.description || "Aucune description fournie."}</p>
        </div>
      </section>

      <section className="organizer-section">
        <h3>Organisateur</h3>
        <div className="organizer-box">
          <div className="avatar">
            {activity.user_picture ? (
              <img src={activity.user_picture} alt="" />
            ) : (
              <span>{getInitial(activity.username)}</span>
            )}
          </div>
          <p>{activity.username}</p>
        </div>
      </section>

      <section className="participants-section">
        <h3>Participants</h3>
        <div className="participants-box">
          {acceptedParticipants.length > 0 ? (
            <ul className="participants-list">
              {acceptedParticipants.map((participant) => (
                <li key={participant.id}>
                  <div className="avatar">
                    {participant.picture ? (
                      <img src={participant.picture} alt="" />
                    ) : (
                      <span>{getInitial(participant.username)}</span>
                    )}
                  </div>
                  <p>{participant.username}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-participants">Aucun participant pour le moment.</p>
          )}
        </div>
      </section>

      <button
        type="button"
        className="reserve-button"
        onClick={() =>
          makeReservation(activity, activity.nb_spots - activity.nb_participant)
        }
        disabled={nbAvailableSpots <= 0}
      >
        {reservationStatus === "already"
          ? "Déjà inscrit"
          : nbAvailableSpots <= 0
            ? "Complet"
            : "Réserver"}
      </button>
    </section>
  );
}

export default ActivityDetails;
