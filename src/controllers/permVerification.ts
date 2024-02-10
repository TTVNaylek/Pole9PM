//Titre: permVerification
//Description : Module controller pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1
import express, { Request, Response, NextFunction } from "express";
import { prisma } from "../ServerModule";
import jwt from "jsonwebtoken";
import * as fs from "fs";

//Récupère les clés privé et public
const privatePem = fs.readFileSync("./key.pem");
const publicPem = fs.readFileSync("./public.pem");

//Fonction pour valider le webtoken de l'utilisateur
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

    //Compare et retourne le token de la DB et celui de l'utilisateur
    return dbToken.userID == jwtToken.sub ? jwtToken.sub : null;
  } catch (error) {
    return null;
  }
};

//Fonction pour vérifier si l'utilisateur est connecté
async function checkCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  //Récupère le token de l'utilisateur actuel
  const currentUser = await validateWebToken(req.cookies.webTokenCookie);

  //Ne bloque pas l'accès à la page ...
  if (["/auth/login"].includes(req.path)) {
    next();
    return;
  }

  //Vérifie si l'utilisateur est connecté
  if (!currentUser) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }
  res.locals.principal = currentUser;
  next();
}
//Fonction pour vérifier les permissions de l'utilisateur
async function checkPermissions(req: Request, res: Response) {
  //Récupère le token de l'utilisateur actuel
  const currentUser = await validateWebToken(req.cookies.webTokenCookie);

  //Vérifie si l'utilisateur est connecté
  if (!currentUser) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }

  //Vérifie si l'utilisateur existe
  const currentUserData = await prisma.user.findUnique({
    where: { id: currentUser },
  });

  //Vérifie si l'utilisateur fait partie du groupe admin, responsable ou pilotage
  if (currentUserData && currentUserData.group === "admin") {
    return "admin";
  } else if (currentUserData && currentUserData.group === "resp") {
    return "responsable";
  } else if (currentUserData && currentUserData.group === "pilotage") {
    return "pilotage";
  }
  //Sinon on retourne une erreur
  return null;
}

export default {
  validateWebToken,
  checkCurrentUser,
  checkPermissions,
};
