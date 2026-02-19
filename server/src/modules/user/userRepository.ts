import databaseClient from "../../../database/client";
import type { Result, Rows } from "../../../database/client";

type NewUser = {
  username: string;
  password: string;
  email: string;
  firstname: string;
  lastname: string;
  born_at: string;
  address: string;
  city: string;
  zip_code: string;
  phone: string;
  picture: string;
};

class userRepository {
  async readByEmail(email: string) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT user.id, user.username, user.picture, user.password, user.email FROM user WHERE user.email = ?",
      [email],
    );

    return rows[0] as Omit<
      User,
      | "firstname"
      | "lastname"
      | "born_at"
      | "adress"
      | "city"
      | "zip_code"
      | "phone"
    >;
  }

  async readById(id: number) {
    const [rows] = await databaseClient.query<Rows>(
      "SELECT id, email, username, firstname, lastname, born_at, address, city, zip_code, phone, picture FROM user WHERE id = ?",
      [id],
    );

    return rows[0] as User | undefined;
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
        newUser.firstname,
        newUser.lastname,
        newUser.born_at,
        newUser.address,
        newUser.city,
        newUser.zip_code,
        newUser.phone,
        newUser.picture,
      ],
    );

    return result;
  }
}

export default new userRepository();
