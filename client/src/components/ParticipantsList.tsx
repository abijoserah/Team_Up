import { useEffect, useRef, useState } from "react";
import { StatusCodes } from "http-status-codes";
import "../styles/ParticipantsList.css";

import { useAuth } from "../context/AuthContext";

type ParticipantsListProps = {
  activityId: number;
  visibility: boolean;
  refreshMyActivities?: (() => void) | undefined;
  nbAvailableSpots: number;
};

function ParticipantsList({
  activityId,
  visibility,
  refreshMyActivities,
  nbAvailableSpots,
}: ParticipantsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [inputGuest, setInputGuest] = useState("");
  const [error, setError] = useState("");

  const { auth } = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/participants?id=${activityId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth?.token}`,
      },
    })
      .then((response) => response.json())
      .then((participants) => setParticipants(participants));
  }, [activityId, auth]);

  async function addGuest() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users?email=${inputGuest}`,
      );

      if (response.status === StatusCodes.NO_CONTENT) {
        throw new Error("Veuillez remplir ce champ");
      }

      if (response.status === StatusCodes.NOT_FOUND) {
        throw new Error("Cette personne n'existe pas");
      }

      if (!response.ok) {
        throw new Error("Erreur lors de l'invitation");
      }

      const user = await response.json();

      const newGuest = {
        userId: user.id,
        activityId: activityId,
        status: "inviting",
      };

      const invitationResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify(newGuest),
        },
      );

      if (invitationResponse.status === StatusCodes.CONFLICT) {
        const errorData = await invitationResponse.json();
        const errorMessage: Record<string, string> = {
          ACTIVITY_FULL: "L'activité est complète",
          ALREADY_INVITED: "Cette personne a déjà été invitée",
        };

        throw new Error(
          errorMessage[errorData.error] || "Une erreur est survenu",
        );
      }

      if (!response.ok) {
        throw new Error("Erreur lors de l'invitation");
      }

      const createdInvitation = await invitationResponse.json();

      const guestToAdd = {
        id: createdInvitation.id,
        userId: user.id,
        username: user.username,
        picture: user.picture,
        status: "inviting",
      };

      setParticipants((prev) => [...prev, guestToAdd]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
    setInputGuest("");
  }

  async function acceptOrRefuseRequest(
    id: number,
    newStatus: string,
    username: string,
    userId: number,
  ) {
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
            status: newStatus,
            userId,
            activityId,
            participantUsername: username,
            type: "request",
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de l'acceptation ou du refus");
      }

      setParticipants((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
      );
      refreshMyActivities?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  function changeInputGuest(e: React.ChangeEvent<HTMLInputElement>) {
    setInputGuest(e.target.value);
    if (e.target.value.length !== 0) {
      setError("");
    }
  }

  const errorRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [error]);

  return (
    <ul className="participant-list">
      {participants.map((participant) => (
        <li key={participant.username}>
          <div>
            {participant.picture ? (
              <img src={participant.picture} alt="participant" />
            ) : (
              <p className="no-picture">
                {participant.username[0].toUpperCase()}
              </p>
            )}
            <p>{participant.username}</p>
          </div>
          {participant.status === "refused" ? (
            <img src="/icons/cross.png" alt="refused" />
          ) : participant.status === "accepted" ? (
            <img src="/icons/check.png" alt="validate" />
          ) : participant.status === "inviting" ? (
            <img src="/icons/hourglass.png" alt="pending" />
          ) : nbAvailableSpots > 0 ? (
            <div>
              <button
                type="button"
                className="btn-accepted"
                onClick={() =>
                  acceptOrRefuseRequest(
                    participant.id,
                    "accepted",
                    participant.username,
                    participant.userId,
                  )
                }
              >
                Accepter
              </button>
              <button
                type="button"
                className="btn-refused"
                onClick={() =>
                  acceptOrRefuseRequest(
                    participant.id,
                    "refused",
                    participant.username,
                    participant.userId,
                  )
                }
              >
                Refuser
              </button>
            </div>
          ) : (
            <p>Complet</p>
          )}
        </li>
      ))}
      {!visibility && (
        <div>
          <div className="guest-line">
            <div className={`guest-inviting ${error ? "guest-error" : ""}`}>
              <svg
                width="22"
                height="22"
                viewBox="0 0 32 32"
                className={`username-inviting ${error ? "username-refused" : ""}`}
              >
                <title>icon profile</title>
                <g id="about">
                  <path d="M16,16A7,7,0,1,0,9,9,7,7,0,0,0,16,16ZM16,4a5,5,0,1,1-5,5A5,5,0,0,1,16,4Z" />

                  <path d="M17,18H15A11,11,0,0,0,4,29a1,1,0,0,0,1,1H27a1,1,0,0,0,1-1A11,11,0,0,0,17,18ZM6.06,28A9,9,0,0,1,15,20h2a9,9,0,0,1,8.94,8Z" />
                </g>
              </svg>
              <input
                type="text"
                placeholder="Inviter des personnes"
                value={inputGuest}
                onChange={(e) => changeInputGuest(e)}
              />
            </div>
            <button
              type="button"
              className="btn-add-guest-y"
              aria-label="Ajouter une personne"
              onClick={() => addGuest()}
            >
              <img src="/icons/add.png" alt="" width="20" height="20" />
            </button>
          </div>
          {error && (
            <p ref={errorRef} className="error-text">
              {error}
            </p>
          )}
        </div>
      )}
    </ul>
  );
}

export default ParticipantsList;
