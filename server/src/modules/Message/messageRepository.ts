import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

class MessageRepository {
  async create(userId: string, activityId: string, content: string) {
    const result = databaseClient.query<Result>(
      `INSERT INTO messages (user_id, activity_id, content)
        VALUES(?, ?, ?)`,
      [userId, activityId, content],
    );

    return result;
  }

  async read(userId: number | null, activityId: number) {
    const rows = databaseClient.query<Rows>(
      `SELECT m.*, u.username,
        COUNT(l.id) AS like_count
        FROM messages AS m
        JOIN user AS u ON m.user_id = u.id
        LEFT JOIN message_likes AS l ON m.id = l.message_id
      WHERE activity_id = ?
      GROUP BY m.id
      ORDER BY m.created_at ASC`,
      [activityId],
    );

    return rows;
  }

  async readSingle(messageId: number) {
    const rows = databaseClient.query<Rows>(
      `SELECT m.*, u.username
        FROM messages AS m
        JOIN user AS u ON m.user_id = u.id
        WHERE m.id = ?`,
      [messageId],
    );

    return rows;
  }

  async createLike(messageId: number, userId: number) {
    const [result] = await databaseClient.query<Result>(
      `INSERT IGNORE INTO message_likes (message_id, user_id)
        VALUES (?, ?)`,
      [messageId, userId],
    );

    return result.affectedRows === 1;
  }

  async updateLikeCount(messageId: string) {
    const [result] = await databaseClient.query<Result>(
      `UPDATE messages SET like_count = like_count + 1
        WHERE messages.id = ?`,
      [messageId],
    );

    return { affectedRows: result.affectedRows };
  }

  async delete(userId: number, messageId: number) {
    const result = databaseClient.query<Result>(
      `DELETE FROM messages 
        WHERE id = ? AND user_id = ?`,
      [messageId, userId],
    );

    return result;
  }
}

export default new MessageRepository();
