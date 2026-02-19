import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

class participationRepository {
  async readAllParticipants(activityId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT participation.id, participation.status, user.id as userId, user.username, user.picture FROM participation
      JOIN user ON participation.user_id = user.id
      WHERE participation.activity_id = ?
      ORDER BY FIELD(participation.status, 'request', 'accepted', 'inviting', 'refused')`,
      [activityId],
    );

    return rows as Participant[];
  }

  async create(newParticipant: newUserType) {
    const [Result] = await databaseClient.query<Result>(
      `INSERT INTO participation (status, user_id, activity_id)
        VALUES ('${newParticipant.status}', ${newParticipant.userId}, ${newParticipant.activityId})`,
    );

    return Result;
  }

  async readUserActity(userId: number) {
    const [rows] = await databaseClient.query<Rows>(
      `SELECT DISTINCT a.id, u.username, a.playing_at, a.city, s.name AS sport_name, p.status 
        FROM participation AS p
        JOIN activity AS a ON a.id = p.activity_id
        JOIN sport AS s ON s.id = a.sport_id
        JOIN user AS u ON a.user_id = u.id
        WHERE p.user_id = ? AND p.status = 'accepted' 
        OR a.user_id = ?
        ORDER BY playing_at ASC`,
      [userId, userId],
    );

    return rows;
  }

  async update(userId: number, activityId: number, status: string) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE participation SET status = ?, updated_at = NOW()
       WHERE user_id = ? AND activity_id = ?`,
      [status, userId, activityId],
    );

    return result;
  }
}

export default new participationRepository();
