import { useNavigate } from "react-router";
import "../styles/ActivityCard.css";
import { StatusCodes } from "http-status-codes";
import ParticipantsList from "./ParticipantsList";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

type ActivityCardType = {
  activity: Activity;
  selectedTab?: string;
  participantsListIsOpen?: boolean;
  onClickListParticipant?: () => void;
  refreshMyActivities?: () => void;
};

function ActivityCard({
  activity,
  selectedTab,
  refreshMyActivities,
  participantsListIsOpen,
  onClickListParticipant,
}: ActivityCardType) {
  const price = Number(activity.price);
  const playing_at = new Date(activity.playing_at);
  const formattedPlayingAt = playing_at.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const nbAvailableSpots = activity.nb_spots - activity.nb_participant;
  const widthProgressBar = (100 / activity.nb_spots) * activity.nb_participant;
  const navigate = useNavigate();

  const { auth } = useAuth();

  const acceptOrRefuseInvitation = async (
    activityId: number,
    status: string,
  ) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participations`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({
            userId: auth?.user.id,
            activityId: activityId,
            status: status,
            participantUsername: auth?.user.username,
            type: "invitation",
          }),
        },
      );
      if (response.status === StatusCodes.CONFLICT) {
        toast.error("Désolé quelqu'un a été plus rapide que vous ;(");
      }
      refreshMyActivities?.();

      if (!response.ok) throw new Error("Failed to accept invitation");

      status === "accepted"
        ? toast.success("Invitation validée")
        : status === "refused" && toast.error("Invitation refusée");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <article
        className={`card ${participantsListIsOpen ? "card-important" : ""}`}
      >
        <div
          className={`card-header ${activity.name}`}
          onClick={() => selectedTab && navigate(`/activities/${activity.id}`)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              selectedTab && navigate(`/activities/${activity.id}`);
            }
          }}
        >
          {!activity.visibility && (
            <div className="icon-lock">
              <img src="/icons/lock.png" alt="lock" />
            </div>
          )}
          <div className="overlay-img"> </div>
          <h2>{activity.name}</h2>
          <p className={`label-price ${price === 0 ? "free" : "paid"}`}>
            {price === 0
              ? "Gratuit"
              : price % 1 === 0
                ? `${price} €`
                : `${price.toFixed(2)} €`}
          </p>
        </div>
        <div className="important-info">
          <img src="/icons/calendar.png" alt="icon-calendar" />
          <p>
            {formattedPlayingAt.charAt(0).toUpperCase() +
              formattedPlayingAt.slice(1)}
          </p>
          <img src="/icons/clock.png" alt="icon-clock" />
          <p>{activity.playing_time.slice(0, 5).replace(":", "h")}</p>
          <img src="/icons/pin.png" alt="icon-pin" />
          <p>{activity.city}</p>
        </div>
        <div className="card-tags">
          <p className="card-tag">
            {activity.level === "all" && "Tous niveaux"}
            {activity.level === "beginner" && "Débutant"}
            {activity.level === "amateur" && "Intermédiaire"}
            {activity.level === "advanced" && "Confirmé"}
          </p>
          <p
            className={`card-tag ${!activity.disabled && "condition-missing"}`}
          >
            <img src="/icons/disabled.png" alt="logo disabled" />
            Handisport
          </p>
          <p className={`card-tag ${!activity.locker && "condition-missing"}`}>
            <img src="/icons/locker.png" alt="logo locker" />
            Vestiaires
          </p>
          <p className={`card-tag ${!activity.shower && "condition-missing"}`}>
            <img src="/icons/shower.png" alt="logo shower" />
            Douches
          </p>
          <p className={`card-tag ${!activity.toilet && "condition-missing"}`}>
            <img src="/icons/toilet.png" alt="logo toilet" />
            Toilettes
          </p>
          <p
            className={`card-tag ${!activity.air_conditioning && "condition-missing"}`}
          >
            <img
              src="/icons/air-conditionning.png"
              alt="logo air conditionning"
            />
            Clim
          </p>
        </div>
        <div className="nb-participant">
          <p>
            <img src="/icons/participants.png" alt="logo participants" />
            {`${activity.nb_participant}/${activity.nb_spots} Participants`}
          </p>
          <p>{`${nbAvailableSpots < 0 ? "0" : nbAvailableSpots} ${nbAvailableSpots <= 1 ? "place restante" : "places restantes"}`}</p>
        </div>
        <div className="bar">
          <div
            className={`progress-bar ${activity.nb_participant >= activity.nb_spots / 2 && "almost-full"} ${nbAvailableSpots === 0 && "full"}`}
            style={{ "--size": `${widthProgressBar}%` } as React.CSSProperties}
          >
            {" "}
          </div>
        </div>
        {selectedTab !== "published" && (
          <div className="card-footer">
            <div className="user-organizer">
              {activity.user_picture ? (
                <img src={activity.user_picture} alt="user" />
              ) : (
                <p className="no-picture">
                  {activity.username[0].toUpperCase()}
                </p>
              )}
              <p>{activity.username}</p>
            </div>
            {selectedTab === "incoming" && (
              <img
                src="/icons/check.png"
                alt="validate"
                className="tag-status"
              />
            )}
            {!selectedTab && (
              <button
                type="button"
                onClick={() => navigate(`/activities/${activity.id}`)}
              >
                {nbAvailableSpots === 0 ? (
                  <>
                    Complet
                    <img src="/icons/bell.png" alt="logo alert" />
                  </>
                ) : (
                  <p>Détails &gt;</p>
                )}
              </button>
            )}
            {selectedTab === "pending" &&
            activity.participation_status === "inviting" ? (
              nbAvailableSpots > 0 ? (
                <div className="invitation-buttons">
                  <button
                    type="button"
                    className="accept-button"
                    onClick={() =>
                      acceptOrRefuseInvitation(activity.id, "accepted")
                    }
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="refuse-button"
                    onClick={() =>
                      acceptOrRefuseInvitation(activity.id, "refused")
                    }
                  >
                    Refuser
                  </button>
                </div>
              ) : (
                <p>Complet</p>
              )
            ) : selectedTab === "pending" &&
              activity.participation_status === "request" ? (
              <img
                src="/icons/hourglass.png"
                alt="pending"
                className="tag-status"
              />
            ) : (
              selectedTab === "pending" &&
              activity.participation_status === "refused" && (
                <img
                  src="/icons/cross.png"
                  alt="refused"
                  className="tag-status"
                />
              )
            )}
          </div>
        )}
        {selectedTab === "published" && (
          <button
            type="button"
            className={`dropdown-participation ${participantsListIsOpen ? "dropdown-open" : ""}`}
            onClick={onClickListParticipant}
            disabled={!activity.total_participant}
          >
            Participants
            <img
              src="/icons/chevron.png"
              alt=""
              className={`${participantsListIsOpen ? "rotate" : ""}`}
            />
          </button>
        )}

        <div
          className={
            nbAvailableSpots === 0 && !selectedTab ? "activity-full" : ""
          }
        >
          {" "}
        </div>

        {participantsListIsOpen && (
          <ParticipantsList
            activityId={activity.id}
            visibility={activity.visibility}
            refreshMyActivities={refreshMyActivities}
            nbAvailableSpots={nbAvailableSpots}
          />
        )}
      </article>
    </>
  );
}

export default ActivityCard;
