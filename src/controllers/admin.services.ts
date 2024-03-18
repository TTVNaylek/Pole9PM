//Titre: Services
//Description : Module des services pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../ServerModule";
//Import du fichier script pour la vérification des permissions
import permVerification from "./auth.permVerification";

//Fonction pour ajouter un nouveau service
//FONCTION ADMIN
const AddService = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id: res.locals.principal },
  });

  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id: currentUser.groupId, MngGrp: true },
      })
    ) {
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
        await prisma.services.findFirst({
          where: { serviceName: serviceName, email: serviceEmail },
        })
      ) {
        return res.status(404).json({
          status: "Service_Error",
          message: "Un service avec cet e-mail existe déjà",
        });
      }
      try {
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
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
      return res.status(200).json({
        status: "Success",
        message: "Service succesfully added",
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

//Fonction permettant de modifier le service
//FONCTION ADMIN
const EditService = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id: res.locals.principal },
  });

  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id: currentUser.groupId, MngGrp: true },
      })
    ) {
      //Récupère les informations de l'utilisateur qui va être modifié
      const {
        newServiceName,
        currentServiceName,
        currentServiceEmail,
        newServiceEmail,
        newServicePassword,
      } = req.body;
      //Vérifie si un service existe
      const service = await prisma.services.findFirst({
        where: { serviceName: currentServiceName, email: currentServiceEmail },
      });

      //Condition qui vérifie qu'un service avec le mail associé existe
      if (!service) {
        return res.status(404).json({
          status: "Service_Error",
          message: "Service doesn't exist",
        });
      }
      try {
        //Création du nouveau salt de l'utilisateur
        const newServiceSalt = crypto.randomBytes(32).toString();
        //Le mot de passe entré dans le formulaire est chiffré + salé
        const newServicePasswSalt = crypto
          .createHash("sha512")
          .update(newServicePassword + newServiceSalt)
          .digest("hex");
        //Modification des données l'utilisateur dans la DB
        await prisma.services.update({
          where: { id: service.id },
          data: {
            serviceName: newServiceName,
            email: newServiceEmail,
            password: newServicePasswSalt,
            salt: newServiceSalt,
          },
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      return res.status(200).json({
        status: "Success",
        message: "service succesfully edited",
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

//Fonction permettant de supprimer le service
//FONCTION ADMIN
const DeleteService = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id: res.locals.principal },
  });

  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id: currentUser.groupId, MngGrp: true },
      })
    ) {
      //Récupère les informations de l'utilisateur qui va être supprimé
      const { serviceName, serviceEmail } = req.body;
      //Vérifie si un compte existe avec l'e-mail dans la database
      const service = await prisma.services.findFirst({
        where: { serviceName: serviceName, email: serviceEmail },
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
        where: { id: service.id },
      });

      return res.status(200).json({
        status: "Success",
        message: "Service succesfully deleted",
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

export default {
  AddService,
  EditService,
  DeleteService,
};
