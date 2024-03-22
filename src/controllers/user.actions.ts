//Titre: User Actions
//Description : Module des actions utilisateurs pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

//Import des dépendances requises
import { Request, Response } from "express";
import { prisma } from "../ServerModule";

const SendLOS = async (req: Request, res: Response) => {
  // Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id_User: res.locals.principal },
  });
  // Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    // Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id_Groupes: currentUser.groupId, ViewLOS: true },
      })
    ) {
      try {
        //Récupère les données de la base de données avec Prisma
        const LOS = await prisma.services.findMany();

        //Envoie les données au Frontend
        res.status(200).json(LOS);
      } catch (error) {
        // Gérer les erreurs
        console.error("Error fetching data:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
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

//Exporte les fonctions pour auth.route
export default { SendLOS };
