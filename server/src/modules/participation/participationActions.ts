import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import participationRepository from "./participationRepository";
import ParticipationRepository from "./participationRepository";
import activityRepository from "../activity/activityRepository";
import mailService from "../../services/mailService";

const browseByActivity: RequestHandler = async (req, res, next) => {
  try {
    const activityId = Number(req.query.id);

    const participants =
      await participationRepository.readAllParticipants(activityId);
    res.json(participants);
  } catch (err) {
    next(err);
  }
};

const browseUserActivity: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      res.status(400).json({ message: "UserId is required" });
      return;
    }

    const activitiesUserEnrolled =
      await participationRepository.readUserActity(userId);

    if (activitiesUserEnrolled.length === 0) {
      res.sendStatus(204);
      return;
    }

    res.status(201).json(activitiesUserEnrolled);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth.sub) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    const response = await participationRepository.create(req.body);

    const mailData = await activityRepository.readWithOrganizer(
      req.body.activityId,
      req.body.userId,
    );

    if (!mailData.visibility) {
      await mailService.sendInvitationEmail(mailData);
    }

    if (mailData.visibility) {
      await mailService.sendRequestEmail(mailData);
    }

    res.json(response);
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      (err as { code?: string }).code === "ER_DUP_ENTRY"
    ) {
      res.status(StatusCodes.CONFLICT).json({ error: "ALREADY_INVITED" });
    }
    next(err);
  }
};

const editStatus: RequestHandler = async (req, res, next) => {
  try {
    if (!req.auth.sub) {
      res.sendStatus(StatusCodes.UNAUTHORIZED);
      return;
    }

    const { userId, activityId, status, participantUsername, type } = req.body;

    const result = await ParticipationRepository.update(
      userId,
      activityId,
      status,
    );

    if (
      (status === "accepted" || status === "refused") &&
      type === "invitation"
    ) {
      const mailData = await activityRepository.readWithOrganizer(
        activityId,
        userId,
      );

      await mailService.sendAnswerInvitationEmail(mailData, status);
    }

    if ((status === "accepted" || status === "refused") && type === "request") {
      const mailData = await activityRepository.readWithOrganizer(
        activityId,
        userId,
      );

      await mailService.sendAnswerRequestEmail(mailData, status);
    }

    res.json({ message: "Participation updated", result });
  } catch (err) {
    next(err);
  }
};

export default {
  add,
  browseUserActivity,
  editStatus,
  browseByActivity,
};
