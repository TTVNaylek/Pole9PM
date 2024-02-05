import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../ServerModule";
import jwt from "jsonwebtoken";
import * as fs from "fs";

//Récupère la clé privée
const privatePem = fs.readFileSync("./key.pem");
const publicPem = fs.readFileSync("./public.pem");

//Fonction de connexion de l'utilisateur
const LoginUser = async (req: Request, res: Response, next: NextFunction) => {
  //Bloc try-catch pour capturer une erreur si une se produit
  try {
    //Récupère e-mail & mot de passe du formulaire de la page web
    const { email, password } = req.body;
    //Vérifie si un compte existe avec l'e-mail dans la database
    const user = await prisma.user.findUnique({ where: { email: email } });
    //Condition pour vérifier qu'un compte avec le mail associé existe
    if (!user) {
      return res.status(404).json({
        status: "Email_Error",
        message: "Incorrect e-mail",
      });
    }
    //Le mot de passe entré dans le formulaire est chiffré
    const formPasswHashed = crypto
      .createHash("sha512")
      .update(password + user.salt)
      .digest("hex");
    //Si le MDP de l'utilisateur est incorrect une erreur est renvoyée
    if (user.password !== formPasswHashed) {
      return res.status(400).json({
        status: "Passw_Error",
        message: "Incorrect password",
      });
    }

    //Création du token utilisateur
    let userInfos = {
      id: user.id,
      name: user.name,
      email: user.email,
      group: user.group,
    };
    const webToken = jwt.sign(userInfos, privatePem, {
      algorithm: "RS256",
      issuer: "p9pm",
      subject: user.id,
    });

    //Sauvegarde dans la DB le webToken
    prisma.userToken.create({
      data: {
        userID: user.id,
        token: webToken,
      },
    });

    //Si toutes les informations sont bonnes alors le token et les infos utilisateur sont envoyés en réponse
    res
      .status(200)
      .cookie("webTokenCookie", webToken, {
        httpOnly: true,
        secure: true,
        sameSite: true,
      })
      .json({
        status: "Success",
        token: webToken,
        user: userInfos,
      });
    //En cas d'erreur un message est retourné au serveur
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Error",
      message: "Server Error",
    });
  }
};

//Fonction pour ajouter un nouvel utilisateur
const AddUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Récupère le token de l'utilisateur actuel
  const currentUser = await validateWebToken(req.cookies.webTokenCookie);
  //Condition qui vérifie que l'utilisateur est bien connecté
  if (currentUser) {
    try {
      // Vérifier si l'utilisateur est dans le groupe admin
      if (
        (await prisma.user.findUnique({ where: { id: currentUser } }))
          ?.group === "admin"
      ) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "User not authenticated",
        });
      }
      //Récupère les informations de l'utilisateur qui va être inscrit
      const { userName, userEmail, userPassword, userGroup } = req.body;
      //Vérifie si un compte existe avec l'e-mail dans la database
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      //Condition pour vérifier qu'un compte avec le mail associé n'existe pas
      if (user) {
        return res.status(404).json({
          status: "User_Error",
          message: "User already exist",
        });
      }
      //Création du salt de l'utilisateur
      const userSalt = crypto.randomBytes(32).toString();
      //Le mot de passe entré dans le formulaire est chiffré
      const userPasswHashed = crypto
        .createHash("sha512")
        .update(userPassword + userSalt)
        .digest("hex");
      //Crée l'utilisateur dans la DB
      await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          password: userPasswHashed,
          salt: userSalt,
          group: userGroup,
        },
      });
      //En cas d'erreur un message est retourné au serveur
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "Error",
        message: "Server Error",
      });
    }
  }
};

const validateWebToken = async (token: string) => {
  try {
    //Vérifie que le token est bien présent dans la DB
    const dbToken = await prisma.userToken.findFirst({
      where: { token: token },
    });
    //S'il n'est pas présent on s'arrete ici
    if (!dbToken) {
      return null;
    }
    //Vérifie si le token n'est pas usurpé avec la public key
    const jwtToken = jwt.verify(token, publicPem);

    //Compare et retrourne le token de la DB et celui de l'utilisateur
    return dbToken.userID == jwtToken.sub ? jwtToken.sub : null;
  } catch (error) {
    return null;
  }
};

//Exporte les fonctions pour auth.route
export default {
  LoginUser,
  AddUserAccount,
  //GenerateOTP,
  //VerifyOTP,
  //ValidateOTP,
  //DisableOTP,
};
