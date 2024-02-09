//Titre: auth.controller
//Description : Module controller pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.5

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../ServerModule";
import jwt from "jsonwebtoken";
import * as fs from "fs";
//Import du fichier script pour la vérification des permissions
import permVerification from "./permVerification";

//Récupère les clés
const privatePem = fs.readFileSync("./key.pem");
const publicPem = fs.readFileSync("./public.pem");

//Fonction de connexion de l'utilisateur
const LoginUser = async (req: Request, res: Response) => {
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
    //const formPasswHashed = crypto
    // .createHash("sha512")
    //  .update(password + user.salt)
    //  .digest("hex");
    //Si le MDP de l'utilisateur est incorrect une erreur est renvoyée
    //if (user.password !== formPasswHashed) {
    //  return res.status(400).json({
    //    status: "Passw_Error",
    //    message: "Incorrect password",
    //  });
    //}

    //Création du token utilisateur
    let userInfos = {
      id: user.id,
      name: user.name,
      email: user.email,
      group: user.group,
      otp_enabled: user.otp_enabled,
    };
    const webToken = jwt.sign(userInfos, privatePem, {
      algorithm: "RS256",
      issuer: "p9pm",
      subject: user.id,
    });

    //Met à jour le token de l'utilisateur ou crée le token de l'utilisateur dans la DB
    await prisma.userToken.upsert({
      where: { userID: user.id },
      update: { token: webToken },
      create: { userID: user.id, token: webToken },
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
//FONCTION ADMIN
const AddUserAccount = async (req: Request, res: Response) => {
  //Condition qui vérifie que l'utilisateur est bien connecté
  if ((await permVerification.checkPermissions(req, res)) == "admin") {
    try {
      //Récupère les informations de l'utilisateur qui va être inscrit
      const { userName, userEmail, userPassword, userGroup } = req.body;

      //Vérifie si l'email est défini et n'est pas vide
      if (!userEmail) {
        return res.status(400).json({
          status: "No_Email",
          message: "L'email de l'utilisateur est manquant ou vide",
        });
      }
      //Condition pour vérifier qu'un compte avec le mail associé n'existe pas
      if (
        await prisma.user.findUnique({
          where: { email: userEmail },
        })
      ) {
        return res.status(404).json({
          status: "User_Error",
          message: "User already exist",
        });
      }
      //Création du salt de l'utilisateur
      const userSalt = crypto.randomBytes(32).toString();
      //Le mot de passe entré dans le formulaire est chiffré + salé
      const userPasswHashed = crypto
        .createHash("sha512")
        .update(userPassword + userSalt)
        .digest("hex");
      //Création l'utilisateur dans la DB
      await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          password: userPasswHashed,
          salt: userSalt,
          group: userGroup,
        },
      });

      res.status(200).json({
        status: "Success",
        message: "User succesfully added",
      });
      //En cas d'erreur un message est retourné au serveur
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "Error",
        message: "Server Error",
      });
    }
  } else {
    res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }
};

//Fonction permettant de modifier le compte de l'utilisateur
//FONCTION ADMIN
const EditUserAccount = async (req: Request, res: Response) => {
  //Condition qui vérifie que l'utilisateur est bien connecté
  if ((await permVerification.checkPermissions(req, res)) == "admin") {
    try {
      //Récupère les informations de l'utilisateur qui va être modifié
      const {
        newUserName,
        currentUserEmail,
        newUserEmail,
        newUserPassword,
        newUserGroup,
      } = req.body;
      //Vérifie si un compte existe avec l'e-mail dans la database
      const user = await prisma.user.findUnique({
        where: { email: currentUserEmail },
      });

      //Condition qui vérifie qu'un compte avec le mail associé existe
      if (!user) {
        return res.status(404).json({
          status: "User_Error",
          message: "User doesn't exist",
        });
      }
      //
      //Création du nouveau salt de l'utilisateur
      const newUserSalt = crypto.randomBytes(32).toString();
      //Le mot de passe entré dans le formulaire est chiffré + salé
      const newUserPasswHashed = crypto
        .createHash("sha512")
        .update(newUserPassword + newUserSalt)
        .digest("hex");
      //Modification des données l'utilisateur dans la DB
      await prisma.user.update({
        where: { email: currentUserEmail },
        data: {
          name: newUserName,
          email: newUserEmail,
          password: newUserPasswHashed,
          group: newUserGroup,
          salt: newUserSalt,
        },
      });
      res.status(200).json({
        status: "Success",
        message: "User succesfully edited",
      });

      //En cas d'erreur un message est retourné au serveur
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "Error",
        message: "Server Error",
      });
    }
  } else {
    res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }
};

//Fonction permettant de supprimer le compte de l'utilisateur
//FONCTION ADMIN
const DeleteUserAccount = async (req: Request, res: Response) => {
  //Condition qui vérifie que l'utilisateur est bien connecté
  if ((await permVerification.checkPermissions(req, res)) == "admin") {
    try {
      //Récupère les informations de l'utilisateur qui va être supprimé
      const { userName, userEmail } = req.body;
      //Vérifie si un compte existe avec l'e-mail dans la database
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
      });
      //Condition qui vérifie qu'un compte avec le mail associé existe
      if (!user) {
        return res.status(404).json({
          status: "User_Error",
          message: "User doesn't exist",
        });
      }
      //Suppression des données l'utilisateur dans la DB
      await prisma.user.delete({
        where: { email: userEmail },
      });

      res.status(200).json({
        status: "Success",
        message: "User succesfully deleted",
      });
      //En cas d'erreur un message est retourné au serveur
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "Error",
        message: "Server Error",
      });
    }
  } else {
    res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }
};

//Exporte les fonctions pour auth.route
export default {
  LoginUser,
  AddUserAccount,
  EditUserAccount,
  DeleteUserAccount,
};
