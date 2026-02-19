import { useEffect, useState } from "react";
import "../styles/Messenger.css";
import { useNavigate } from "react-router";
import { formatMessageTime } from "../hooks/DataFormater";
import { useAuth } from "../context/AuthContext";
import GroupChat from "../components/GroupChat";

type UsersActivities = {
  id: number;
  sport_name: string;
  city: string;
  playing_at: string;
  username: string;
};

function Messenger() {
  const navigate = useNavigate();
  const [userActivities, setUserActivities] = useState<
    UsersActivities[] | undefined
  >();
  const [selectedActivity, setSelectedActivity] = useState<UsersActivities>();

  const { auth } = useAuth();

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    const load = async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/participations?userId=${auth?.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );
      const data: UsersActivities[] = await res.json();
      const unique = [
        ...new Map(data.map((a: UsersActivities) => [a.id, a])).values(),
      ];
      setUserActivities(unique);
    };

    if (auth?.user?.id) load();
  }, [auth]);

  const openChatroom = (a: UsersActivities) => {
    if (isMobile) {
      navigate(`/chat/${a.id}`, {
        state: { activity: a, isMobile: isMobile },
      });
    } else {
      setSelectedActivity(a);
    }
  };

  return (
    <>
      <div className="messanger-layout">
        <div className="chats-container">
          {userActivities?.length === 0 && (
            <h3>
              Vos messages apparaîtront ici une fois que vous vous serez inscrit
              à une activité.
            </h3>
          )}
          <div className="no-chat-selected">Sélectionnez une conversation</div>
          {userActivities?.map((a) => (
            <button
              type="button"
              key={a.id}
              className={`chat-wrapper ${a.id === selectedActivity?.id && "selected-chat"}`}
              onClick={() => openChatroom(a)}
            >
              <div className={`sport-img ${a.sport_name}`} />
              <div className="sub-chat-wrapper">
                <h2>{a.sport_name}</h2>
                <div className="sub-chat">
                  <p>{a.city}</p>
                  <p
                    className="message-date"
                    style={
                      a.id === selectedActivity?.id
                        ? { color: "var(--light-color)" }
                        : {}
                    }
                  >
                    {formatMessageTime(a.playing_at)}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {!isMobile && (
          <div className="chat-panel">
            {selectedActivity && (
              <GroupChat
                key={selectedActivity.id}
                activity={selectedActivity}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default Messenger;
