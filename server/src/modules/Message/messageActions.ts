import type { RequestHandler } from "express";
import MessageRepository from "./messageRepository";
import LongPollManager from "../../services/longPolling";
import messageRepository from "./messageRepository";
import { StatusCodes } from "http-status-codes";

const browse: RequestHandler = async (req, res, next) => {
  const userId = req.auth?.sub ? Number(req.auth.sub) : null;

  const activityId = Number(req.query.activityId);

  try {
    const [messages] = await MessageRepository.read(userId, activityId);

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  const { userId, activityId, content } = req.body;

  try {
    const [result] = await MessageRepository.create(
      userId,
      activityId,
      content,
    );

    if (result.affectedRows === 0) {
      res.status(400).json({ message: "Message Cannot be created" });
    }

    const [message] = await MessageRepository.readSingle(result.insertId);
    const newMessage = message[0];

    LongPollManager.notifyWaiting(activityId.toString(), newMessage as Message);

    res.status(201).json({ message: "Message Created", result });
  } catch (err) {
    next(err);
  }
};

const poll: RequestHandler = async (req, res) => {
  const activityId = req.query.activityId as string;
  let timeoutId: NodeJS.Timeout | null = null;
  let responseSent = false;

  const sendResponse = (messages: Message[]) => {
    if (responseSent) {
      return;
    }

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    responseSent = true;

    res.json({ messages });
  };

  LongPollManager.addWaiting(activityId, sendResponse);

  timeoutId = setTimeout(() => {
    LongPollManager.removeWaiting(activityId, sendResponse);
    res.json({ messages: [] });
  }, 25000);

  req.on("close", () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    LongPollManager.removeWaiting(activityId, sendResponse);
  });
};

const addLike: RequestHandler = async (req, res, next) => {
  try {
    const { messageId, userId } = req.body;

    const inserted = await messageRepository.createLike(messageId, userId);

    if (!inserted) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ error: "User already liked this message" });
      return;
    }

    const updatedCount = await messageRepository.updateLikeCount(messageId);

    if (!updatedCount) {
      res
        .status(StatusCodes.CREATED)
        .json({ error: "Like count is not updated", success: false });
      return;
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
    });
  } catch (err) {
    next(err);
  }
};

const deleteMessage: RequestHandler = async (req, res, next) => {
  const { userId, messageId } = req.body;

  const [deleteResult] = await MessageRepository.delete(userId, messageId);

  if (deleteResult.affectedRows === 0) {
    res.status(StatusCodes.NOT_FOUND).json({ error: "Message not found" });
    return;
  }

  res.status(StatusCodes.OK).json({ success: true });
};

export default { add, browse, poll, addLike, deleteMessage };
