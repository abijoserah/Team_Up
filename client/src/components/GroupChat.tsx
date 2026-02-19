import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { useNavigate } from "react-router";
import { formatMessageTime } from "../hooks/DataFormater";
import { useAuth } from "../context/AuthContext";

type groupChatType = {
  activity?: {
    id: number;
    sport_name: string;
    city: string;
    playing_at: string;
  };
  isMobile?: boolean;
};

type MessageType = {
  activity_id: number;
  content: string;
  created_at: string;
  deleted_at: string;
  id: number;
  updated_at: string;
  user_id: number;
  username: string;
  like_count: number;
};

function GroupChat({ activity: activityProp }: groupChatType) {
  const location = useLocation();
  const { auth } = useAuth();

  const activity = activityProp ?? location.state?.activity;
  const isMobile = location.state?.isMobile;
  const navigate = useNavigate();

  const [typeMessage, setTypeMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);

  const shouldPoll = useRef(true);
  const isPollingRef = useRef(false);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/message?activityId=${activity.id}`,
          {
            method: "GET",
            headers: auth?.user
              ? {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${auth?.token}`,
                }
              : {
                  "Content-Type": "application/json",
                },
          },
        );

        if (!res.ok) throw new Error("Fetch failed");

        setMessages(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    getMessages();
  }, [activity.id, auth]);

  useEffect(() => {
    if (isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;
    shouldPoll.current = true;
    startPolling();

    return () => {
      shouldPoll.current = false;
    };
  }, []);

  const startPolling = async () => {
    if (!shouldPoll.current) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/message/poll?activityId=${activity.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Poll request failed");

      const data = await response.json();

      if (data.messages.length > 0 && shouldPoll.current) {
        setMessages((prev) => [...prev, ...data.messages]);
      }

      if (shouldPoll.current) {
        startPolling();
      }
    } catch (err) {
      console.error("Error polling:", err);

      if (shouldPoll.current) {
        setTimeout(startPolling, 3000);
      }
    }
  };

  const sendMessage = async () => {
    if (typeMessage.length === 0) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({
            content: typeMessage,
            userId: auth?.user.id,
            activityId: activity.id,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to send a message");
      }

      setTypeMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  const addLike = async (m: MessageType) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/message/likes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({
            messageId: m.id,
            userId: auth?.user.id,
          }),
        },
      );
      const likeCountStatus = await res.json();

      if (likeCountStatus.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === m.id
              ? {
                  ...msg,
                  like_count: msg.like_count + 1,
                }
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMessage = async (m: MessageType) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/message/delete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth?.token}`,
          },
          body: JSON.stringify({
            userId: auth?.user.id,
            messageId: m.id,
          }),
        },
      );
      const messageDeleteStatus = await res.json();

      if (messageDeleteStatus.success) {
        setMessages((prev: MessageType[]) => {
          return prev.filter((msg) => msg.id !== m.id);
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="chat-room">
        {!isMobile && (
          <p className="chat-header">
            {activity.sport_name} à{" "}
            <span>{formatMessageTime(activity.playing_at)}</span>
          </p>
        )}

        {isMobile && (
          <div className="mob-chat-header">
            <button
              type="button"
              className="like-btn"
              onClick={() => navigate("/messenger")}
            >
              <img src="/icons/move-left.svg" alt="Move-left-arrow" />
            </button>
            <p>
              {activity.sport_name} à{" "}
              <span>{formatMessageTime(activity.playing_at)}</span>
            </p>
          </div>
        )}

        <div className="messages-display">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`single-message ${m.user_id === auth?.user.id ? "users-message" : "others-messages"}`}
            >
              <div
                className={`${m.user_id === auth?.user.id ? "my-user-date" : "user-date"}`}
              >
                <h3
                  className={`username ${m.user_id === auth?.user.id && "my-username"}`}
                >
                  {m.username}
                </h3>
                <small className="message-date">
                  {formatMessageTime(m.created_at)}
                </small>
              </div>
              <p className="msg-content">{m.content}</p>
              <div className="like-delete-wrap">
                <button
                  type="button"
                  className="like-btn"
                  onClick={() => addLike(m)}
                >
                  <img src="/icons/thumbs-up.svg" alt="Like" />
                  <span className="like-count">
                    {m.like_count !== 0 && m.like_count}
                  </span>
                </button>
                {m.user_id === auth?.user.id && (
                  <button
                    type="button"
                    className="like-btn"
                    onClick={() => deleteMessage(m)}
                  >
                    <img src="/icons/trash.svg" alt="delete img" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={typeMessage}
            placeholder="Message..."
            onChange={(e) => {
              e.preventDefault();
              setTypeMessage(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div /*ref={messagesEndRef}*/ />
        </div>
      </div>
    </>
  );
}

export default GroupChat;
