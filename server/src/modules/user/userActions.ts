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

    res.status(StatusCodes.OK).json(user);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  function hasCode(err: unknown): err is { code: string } {
    return typeof err === "object" && err !== null && "code" in err;
  }

  try {
    req.body.password = await argon2.hash(req.body.password, {
      type: argon2.argon2id,
      memoryCost: 19 * 2 ** 10 /* 19 Mio en kio (19 * 1024 kio) */,
      timeCost: 2,
      parallelism: 1,
    });
    const insertId = await userRepository.create(req.body);
    res.status(StatusCodes.OK).json({ insertId });
  } catch (err: unknown) {
    if (hasCode(err) && err.code === "ER_DUP_ENTRY") {
      res
        .status(StatusCodes.CONFLICT)
        .json({ message: "Nom d'utilisateur ou email déja existant" });
    } else {
      next(err);
    }
  }
};

const validate: RequestHandler = async (req, res, next) => {
  const createUserSchema = Joi.object({
    username: Joi.string().trim().min(1).max(30).required().messages({
      "string.empty": "Le nom d'utilisateur n'est pas renseigné",
      "string.max": "Le nom d'utilisateur est trop long (30 caractères max)",
    }),
    email: Joi.string().trim().email().required().messages({
      "string.email": "Email invalide",
      "string.empty": "L'email n'est pas renseigné",
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/)
      .max(72)
      .required()
      .messages({
        "string.pattern.base": "Mot de passe invalide",
        "string.empty": "Le mot de passe n'est pas renseigné",
        "string.min": "Le mot de passe est trop court",
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Les deux mots de passe sont différents" }),
    firstname: Joi.string().trim().min(1).max(50).required().messages({
      "string.empty": "Le prénom n'est pas renseigné",
    }),
    lastname: Joi.string().trim().min(1).max(50).required().messages({
      "string.empty": "Le nom n'est pas renseigné",
    }),
    born_at: Joi.string().required().messages({
      "string.empty": "La date de naissance n'est pas renseignée",
    }),
    address: Joi.string().trim().required().messages({
      "string.empty": "L'adresse' n'est pas renseignée",
    }),
    city: Joi.string().trim().required().messages({
      "string.empty": "La ville n'est pas renseignée",
    }),
    zip_code: Joi.string()
      .trim()
      .required()
      .pattern(/^\d{5}$/)
      .messages({
        "string.empty": "Le code postal n'est pas renseigné",
        "string.pattern.base": "Le code postal doit être composé de 5 chiffres",
      }),
    phone: Joi.string()
      .trim()
      .replace(/\s+/g, "")
      .required()
      .pattern(/^\d{10}$/)
      .messages({
        "string.empty": "Le numéro de téléphone n'est pas renseigné",
        "string.pattern.base":
          "Le numéro de téléphone doit être composé de 10 chiffres",
      }),
    picture: Joi.string().trim().allow("").optional(),
  }).options({ abortEarly: false, stripUnknown: true });
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      res.status(StatusCodes.BAD_REQUEST).json(error.details[0]);
      return;
    }
    req.body = value;
    next();
  } catch (err) {
    next(err);
  }
};

const read: RequestHandler = async (req, res, next) => {
  try {
    const userId = Number.parseInt(req.auth.sub, 10);
    const user = await userRepository.readById(userId);

    if (!user) {
      res.sendStatus(StatusCodes.NOT_FOUND);
      return;
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
};

export default { readByEmail, add, validate, read };
