import type { RequestHandler } from "express";
import userRepository from "../user/userRepository";
import { StatusCodes } from "http-status-codes";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const logIn: RequestHandler = async (req, res, next) => {
  try {
    const user = await userRepository.readByEmail(req.body.email);

    if (!user) {
      res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
      return;
    }

    const verified = await argon2.verify(user.password, req.body.password);

    if (verified) {
      const { password, ...userWithoutPassword } = user;

      const myPayload: MyPayload = {
        sub: user.id.toString(),
      };

      const token = await jwt.sign(
        myPayload,
        process.env.APP_SECRET as string,
        {
          expiresIn: "12h",
        },
      );

      res.json({
        token,
        user: userWithoutPassword,
      });
    } else {
      res.sendStatus(StatusCodes.UNPROCESSABLE_ENTITY);
    }
  } catch (err) {
    next(err);
  }
};

const verifyToken: RequestHandler = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      return next();
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }

    req.auth = jwt.verify(token, process.env.APP_SECRET as string) as MyPayload;

    next();
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
};

export default { logIn, verifyToken };
