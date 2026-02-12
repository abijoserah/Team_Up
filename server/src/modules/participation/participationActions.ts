import type { RequestHandler } from "express";
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

const add: RequestHandler = async (req, res, next) => {
  try {
    const response = await participationRepository.create(req.body);

    res.json(response);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const affectedRows = await participationRepository.patch(id, status);

    if (affectedRows === 0) {
      res.sendStatus(404);
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    next(err);
  }
};

const browseSome: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number(req.query.userId);

    if (!userId) {
      res.json({
        message: "User is not enrolled in any activity",
      });
      return;
    }

    const activitiesUserEnrolled = await participationRepository.read({
      userId,
    });

    res.status(201).json(activitiesUserEnrolled.map((a) => a.activity_id));
  } catch (err) {
    next(err);
  }
};

const editStatus: RequestHandler = async (req, res, next) => {
  try {
    const { userId, activityId, status, participantUsername } = req.body;

    console.log(req.body);

    const result = await ParticipationRepository.update(
      userId,
      activityId,
      status,
    );

    console.log(result);

    if (status === "accepted") {
      const activity = await activityRepository.readWithOrganizer(activityId);

      await mailService.sendInvitationAcceptedEmail({
        organizerEmail: activity.organizer_email,
        organizerUsername: activity.organizer_username,
        activityName: activity.name,
        participantUsername: participantUsername,
      });
    }

    res.json({ message: "Participation updated", result });
  } catch (err) {
    next(err);
  }
};

const deleteParticipation: RequestHandler = async (req, res, next) => {
  try {
    const { userId, activityId } = req.body;

    const result = await ParticipationRepository.delete(userId, activityId);

    res.json({ message: "Participation deleted", result });
  } catch (err) {
    next(err);
  }
};

export default {
  add,
  browseSome,
  editStatus,
  deleteParticipation,
  edit,
  browseByActivity,
};
