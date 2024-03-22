//Titre : auth.controller
//Description : Module controller pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.5

import crypto from "crypto";
import jwt from "jsonwebtoken";
import * as fs from "fs";
import { Request, Response } from "express";
import { prisma } from "../ServerModule";
//Import du fichier script pour la vérification des permissions
import authPermVerification from "./auth.permVerification";
//Récupère la clé privée
const privatePem = fs.readFileSync("./key.pem");

//Fonction de connexion de l'utilisateur
const LoginUser = async (req: Request, res: Response) => {
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
  if (!password) {
    return res.status(404).json({
      status: "Passw_Error",
      message: "Password Empty",
    });
  }
  //Le mot de passe entré dans le formulaire est chiffré
  // const formPasswHashed = crypto
  //   .createHash("sha512")
  //   .update(password + user.salt)
  //   .digest("hex");
  // //Si le MDP de l'utilisateur est incorrect une erreur est renvoyée
  // if (user.password !== formPasswHashed) {
  //   return res.status(400).json({
  //     status: "Passw_Error",
  //     message: "Incorrect password",
  //   });
  // }

  //Création du token utilisateur
  let userInfos = {
    id: user.id_User,
    name: user.name,
    email: user.email,
    group: user.groupId,
    otp_enabled: user.otp_enabled,
  };
  //Signe le token avec une clé privée
  const webToken = jwt.sign(userInfos, privatePem, {
    algorithm: "RS256",
    issuer: "p9pm",
    subject: user.id_User,
  });

  //Met à jour le token de l'utilisateur ou crée le token de l'utilisateur dans la DB
  await prisma.userToken.upsert({
    where: { userID: user.id_User },
    update: { token: webToken },
    create: { userID: user.id_User, token: webToken },
  });
  //Si toutes les informations sont bonnes alors le token et les infos utilisateur sont envoyés en réponse
  res
    .status(200)
    .cookie("webTokenCookie", webToken, {
      httpOnly: true,
      //secure: true,
      sameSite: true,
    })
    .json({
      status: "Success",
      token: webToken,
      user: userInfos,
    });
};

//Fonction pour ajouter un nouvel utilisateur
//FONCTION ADMIN
const AddUserAccount = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id_User: res.locals.principal },
  });
  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id_Groupes: currentUser.groupId, MngMembers: true },
      })
    ) {
      //Récupère les informations de l'utilisateur qui va être inscrit
      const { userName, userEmail, userPassword, userGroup } = req.body;
      //Vérifie si l'email est défini et n'est pas vide
      if (!userEmail) {
        return res.status(400).json({
          status: "No_Email",
          message: "User email is missing or empty",
        });
      }
      if (!userGroup) {
        return res.status(400).json({
          status: "No_Group",
          message: "User group is missing or empty",
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
          message: "Utilisateur existant",
        });
      }
      try {
        //Création du salt de l'utilisateur
        const userSalt = crypto.randomBytes(32).toString("base64");
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
            group: { connect: { id_Groupes: userGroup } },
          },
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      return res.status(200).json({
        status: "Success",
        message: "User succesfully added",
      });
    } else {
      // Retourne une erreur si l'utilisateur n'a pas la permission
      return res.status(401).json({
        status: "Unauthorized",
        message: "Utilisateur non autorisé",
      });
    }
  } else {
    // Retourne une erreur si l'utilisateur n'est pas trouvé ou n'a pas de groupe attribué
    return res.status(404).json({
      status: "Access denied",
      message: "Not permitted",
    });
  }
};

//Fonction permettant de modifier le compte de l'utilisateur
//FONCTION ADMIN
const EditUserAccount = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id_User: res.locals.principal },
  });
  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id_Groupes: currentUser.groupId, MngMembers: true },
      })
    ) {
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
      const newUserSalt = crypto.randomBytes(32).toString("base64");
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
      return res.status(200).json({
        status: "Success",
        message: "User succesfully edited",
      });
    } else {
      // Retourne une erreur si l'utilisateur n'a pas la permission
      return res.status(401).json({
        status: "Unauthorized",
        message: "Utilisateur non autorisé",
      });
    }
  } else {
    // Retourne une erreur si l'utilisateur n'est pas trouvé ou n'a pas de groupe attribué
    return res.status(404).json({
      status: "Access denied",
      message: "Not permitted",
    });
  }
};

//Fonction permettant de supprimer le compte de l'utilisateur
//FONCTION ADMIN
const DeleteUserAccount = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id_User: res.locals.principal },
  });

  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id_Groupes: currentUser.groupId, MngGrp: true },
      })
    ) {
      //Récupère les informations de l'utilisateur qui va être supprimé
      const { userEmail } = req.body;
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

      return res.status(200).json({
        status: "Success",
        message: "User succesfully deleted",
      });
    } else {
      // Retourne une erreur si l'utilisateur n'a pas la permission
      return res.status(401).json({
        status: "Unauthorized",
        message: "Utilisateur non autorisé",
      });
    }
  } else {
    // Retourne une erreur si l'utilisateur n'est pas trouvé ou n'a pas de groupe attribué
    return res.status(404).json({
      status: "Access denied",
      message: "Not permitted",
    });
  }
};

//Fonction permettant de se déconnecter
const Logout = async (req: Request, res: Response) => {
  //Récupère le cookie de session qui contient le token
  const userToken = String(req.cookies.webTokenCookie);

  //Vérification que le cookie est bien présent
  if (!userToken) {
    return res.status(401).json({
      status: "User_Error",
      message: "Unauthorized",
    });
  }
  //Récupération des informations utilisateurs dans le token
  const currentUser = await authPermVerification.validateWebToken(userToken);

  //Vérification si l'utilisateur existe
  if (!currentUser) {
    return res.status(401).json({
      status: "User_Error",
      message: "User not found or disconnected",
    });
  }
  //Supprime la ligne de la table UserToken correspondant à l'utilisateur
  await prisma.userToken.deleteMany({ where: { userID: currentUser } });

  //Effacer le cookie du client
  res.clearCookie("webTokenCookie");

  return res.status(200).json({
    status: "Success",
    message: "User successfully disconnected",
  });
};

//Exporte les fonctions pour auth.route
export default {
  LoginUser,
  AddUserAccount,
  EditUserAccount,
  DeleteUserAccount,
  Logout,
};
