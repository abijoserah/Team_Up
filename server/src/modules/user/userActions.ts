import type { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import userRepository from "./userRepository";
import Joi from "joi";
import argon2 from "argon2";

const readByEmail: RequestHandler = async (req, res, next) => {
  try {
    const email = req.query.email as string;

    if (email.trim() === "") {
      res.sendStatus(StatusCodes.NO_CONTENT);
      return;
    }

    const user = await userRepository.readByEmail(email);

    if (!user) {
      res.sendStatus(StatusCodes.NOT_FOUND);
      return;
    }

    res.json(user).status(StatusCodes.OK);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    req.body.password = await argon2.hash(req.body.password, {
      type: argon2.argon2id,
      memoryCost: 19 * 2 ** 10 /* 19 Mio en kio (19 * 1024 kio) */,
      timeCost: 2,
      parallelism: 1,
    });
    const insertId = await userRepository.create(req.body);
    res.status(200).json({ insertId });
  } catch (err) {
    res.status(409).json();
    next(err);
  }
};

const validate: RequestHandler = async (req, res, next) => {
  const createUserSchema = Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(8).max(72).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    email: Joi.string().trim().email().required(),
    firstName: Joi.string().trim().min(1).max(50).required(),
    lastName: Joi.string().trim().min(1).max(50).required(),
    born_at: Joi.string().required(),
    address: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    zipCode: Joi.string().trim().required(),
    phone: Joi.string().trim().required(),
    picture: Joi.string().trim().allow("").optional(),
  }).options({ abortEarly: false, stripUnknown: true });
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      res.status(400).json({ error: "VALIDATION_ERROR" });
      return;
    }
    req.body = value;
    next();
  } catch (err) {
    next(err);
  }
};

export default { readByEmail, add, validate };
