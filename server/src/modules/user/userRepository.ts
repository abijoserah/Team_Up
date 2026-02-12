import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type NewUser = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  born_at: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  picture: string;
};

class userRepository {
  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT user.id, user.username, user.picture, user.email FROM user WHERE user.email = ?",
      [email],
    );

    return rows[0] as Partial<User>;
  }

  async create(newUser: NewUser) {
    const [result] = await databaseClient.query<Result>(
      `INSERT INTO user (
      username,
      password,
      email,
      firstName,
      lastName,
      born_at,
      address,
      city,
      zip_code,
      phone,
      picture
      )
      VALUES (? , ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUser.username,
        newUser.password,
        newUser.email,
        newUser.firstName,
        newUser.lastName,
        newUser.born_at,
        newUser.address,
        newUser.city,
        newUser.zipCode,
        newUser.phone,
        newUser.picture,
      ],
    );

    return result;
  }
}

export default new userRepository();
