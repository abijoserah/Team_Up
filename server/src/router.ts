import express from "express";
import activityActions from "./modules/Activity/activityActions";
import sportActions from "./modules/sport/sportActions";
import userActions from "./modules/user/userActions";
import participationActions from "./modules/participation/participationActions";

const router = express.Router();

router.get("/api/sports", sportActions.browse);

router.get("/api/users", userActions.readByEmail);

router.post("/api/activity", activityActions.add);

router.get("/api/activities", activityActions.browse);
router.get("/api/activities/me", activityActions.browseMine);
router.post(
  "/api/users",
  userActions.validate,
  userActions.add,
);
router.get("/api/activities/:id", activityActions.read);

router.get("/api/participations", participationActions.browseSome);
router.get("/api/participants", participationActions.browseByActivity);
router.post("/api/participation", participationActions.add);
router.put("/api/participation", participationActions.editStatus);
router.patch("/api/participant/:id", participationActions.edit);
router.delete("/api/participation", participationActions.deleteParticipation);

export default router;
