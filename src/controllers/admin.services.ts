//Titre: Services
//Description : Module des services pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../ServerModule";
//Import du fichier script pour la vérification des permissions
import permVerification from "./auth.permVerification";

//Fonction pour ajouter un nouveau service
//FONCTION ADMIN
const AddService = async (req: Request, res: Response, next: NextFunction) => {
  //Condition qui vérifie si l'utilisateur est du groupe admin
  if ((await permVerification.checkPermissions(req, res, next)) == "admin") {
    try {
      //Récupère les informations du service
      const { serviceName, serviceEmail, servicePassword } = req.body;
      //Condition qui vérifie si l'e-mail du sevice est vide
      if (!serviceEmail) {
        return res.status(400).json({
          status: "No_Email",
          message: "Service email is missing or empty",
        });
      }
      //Condition pour vérifier qu'un service avec le mail associé n'existe pas
      if (
        await prisma.services.findUnique({
          where: { email: serviceEmail },
        })
      ) {
        return res.status(404).json({
          status: "Service_Error",
          message: "Un service avec cet e-mail existe déjà",
        });
      }
      //Création du salt du service
      const serviceSalt = crypto.randomBytes(32).toString();
      //Le mot de passe entré dans le formulaire est chiffré + salé
      const servicePasswHashed = crypto
        .createHash("sha512")
        .update(servicePassword + serviceSalt)
        .digest("hex");
      //Création du service dans la DB
      await prisma.services.create({
        data: {
          serviceName: serviceName,
          email: serviceEmail,
          password: servicePasswHashed,
          salt: serviceSalt,
        },
      });
      res.status(200).json({
        status: "Success",
        message: "Service succesfully added",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "Error",
        message: "Server Error",
      });
    }
    //En cas d'erreur un message est retourné au serveur
  } else {
    res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }
};

//Fonction permettant de modifier le service
//FONCTION ADMIN
const EditService = async (req: Request, res: Response, next: NextFunction) => {
  //Condition qui vérifie que l'utilisateur est bien connecté
  if ((await permVerification.checkPermissions(req, res, next)) == "admin") {
    try {
      //Récupère les informations de l'utilisateur qui va être modifié
      const {
        newServiceName,
        currentServiceEmail,
        newServiceEmail,
        newServicePassword,
      } = req.body;
      //Vérifie si un service existe
      const service = await prisma.services.findUnique({
        where: { email: currentServiceEmail },
      });

      //Condition qui vérifie qu'un service avec le mail associé existe
      if (!service) {
        return res.status(404).json({
          status: "Service_Error",
          message: "Service doesn't exist",
        });
      }
      //Création du nouveau salt de l'utilisateur
      const newServiceSalt = crypto.randomBytes(32).toString();
      //Le mot de passe entré dans le formulaire est chiffré + salé
      const newServicePasswSalt = crypto
        .createHash("sha512")
        .update(newServicePassword + newServiceSalt)
        .digest("hex");
      //Modification des données l'utilisateur dans la DB
      await prisma.services.update({
        where: { email: currentServiceEmail },
        data: {
          serviceName: newServiceName,
          email: newServiceEmail,
          password: newServicePasswSalt,
          salt: newServiceSalt,
        },
      });
      res.status(200).json({
        status: "Success",
        message: "service succesfully edited",
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

//Fonction permettant de supprimer le service
//FONCTION ADMIN
const DeleteService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //Condition qui vérifie que l'utilisateur est bien connecté
  if ((await permVerification.checkPermissions(req, res, next)) == "admin") {
    try {
      //Récupère les informations de l'utilisateur qui va être supprimé
      const { serviceName, serviceEmail } = req.body;
      //Vérifie si un compte existe avec l'e-mail dans la database
      const service = await prisma.services.findUnique({
        where: { email: serviceEmail },
      });
      //Condition qui vérifie qu'un compte avec le mail associé existe
      if (!service) {
        return res.status(404).json({
          status: "Service_Error",
          message: "Service doesn't exist",
        });
      }
      //Suppression des données l'utilisateur dans la DB
      await prisma.services.delete({
        where: { email: serviceEmail },
      });

      res.status(200).json({
        status: "Success",
        message: "Service succesfully deleted",
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

export default {
  AddService,
  EditService,
  DeleteService,
};
