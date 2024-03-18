import { Request, Response } from "express";
import { prisma } from "../ServerModule";
//Import du fichier script pour la vérification des permissions

const AddGroup = async (req: Request, res: Response) => {
  //Récupère l'utilisateur dans la DB correspondant à l'id
  const currentUser = await prisma.user.findFirst({
    where: { id: res.locals.principal },
  });
  //Condition qui vérifie si l'utilisateur et l'id du groupe de l'utilisateur sont non vide
  if (currentUser !== null && currentUser.groupId !== null) {
    //Condition qui vérifie si le groupe de l'utilisateur à la permission
    if (
      await prisma.groupes.findFirst({
        where: { id: currentUser.groupId, MngGrp: true },
      })
    ) {
      //Récupère les informations du nouveau groupe
      const {
        grpName,
        a2fPerm,
        viewLoS,
        viewIdS,
        viewPasswAge,
        copyPassw,
        mngMembers,
        mngMembersGrp,
        mngServices,
        hstrySrvUsed,
        mngGrp,
      } = req.body;
      //Vérifie que le nom du groupe n'est pas vide
      if (!grpName) {
        return res.status(400).json({
          status: "No_GrpName",
          message: "Group name is missing or empty",
        });
      }
      // Condition pour vérifier qu'un groupe avec le nom associé n'existe pas
      if (
        await prisma.groupes.findUnique({
          where: { GroupName: grpName },
        })
      ) {
        return res.status(404).json({
          status: "Grp_Error",
          message: "Group existing",
        });
      }
      //Création du groupe dans la DB
      await prisma.groupes.create({
        data: {
          GroupName: grpName,
          A2F: a2fPerm,
          ViewLOS: viewLoS,
          ViewIDs: viewIdS,
          ViewPsswAge: viewPasswAge,
          CopyPassw: copyPassw,
          MngMembers: mngMembers,
          MngMembersGrp: mngMembersGrp,
          MngServices: mngServices,
          HstrySrvUsed: hstrySrvUsed,
          MngGrp: mngGrp,
        },
      });
      return res.status(200).json({
        status: "Success",
        message: "Group succesfully added",
      });
    }
    //Sinon retourne une erreur
    else {
      return res.status(404).json({
        status: "Access denied",
        message: "Not permitted",
      });
    }
  }
  //Sinon retourne une erreur
  else {
    return res.status(401).json({
      status: "Unauthorized",
      message: "Utilisateur non autorisé",
    });
  }
};
const EditGroup = async (req: Request, res: Response) => {
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
      // Récupère les informations du nouveau groupe
      const {
        grpName,
        newgrpName,
        a2fPerm,
        viewLoS,
        viewIdS,
        viewPasswAge,
        copyPassw,
        mngMembers,
        mngMembersGrp,
        mngServices,
        hstrySrvUsed,
        mngGrp,
      } = req.body;

      // Vérifie que le nom du groupe n'est pas vide
      if (!grpName) {
        return res.status(400).json({
          status: "No_GrpName",
          message: "Group name is missing or empty",
        });
      }

      // Condition pour vérifier qu'un groupe avec le nom associé n'existe pas
      if (
        !(await prisma.groupes.findUnique({
          where: { GroupName: grpName },
        }))
      ) {
        return res.status(404).json({
          status: "Grp_Error",
          message: "Group didn't existing",
        });
      }

      // Update du groupe dans la DB
      await prisma.groupes.update({
        where: { GroupName: grpName },
        data: {
          GroupName: newgrpName,
          A2F: a2fPerm,
          ViewLOS: viewLoS,
          ViewIDs: viewIdS,
          ViewPsswAge: viewPasswAge,
          CopyPassw: copyPassw,
          MngMembers: mngMembers,
          MngMembersGrp: mngMembersGrp,
          MngServices: mngServices,
          HstrySrvUsed: hstrySrvUsed,
          MngGrp: mngGrp,
        },
      });
      return res.status(200).json({
        status: "Success",
        message: "Group succesfully edited",
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

const DeleteGroup = async (req: Request, res: Response) => {
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
      // Récupère les informations du nouveau groupe
      const { grpName } = req.body;

      // Vérifie que le nom du groupe n'est pas vide
      if (!grpName) {
        return res.status(400).json({
          status: "No_GrpName",
          message: "Group name is missing or empty",
        });
      }

      // Condition pour vérifier qu'un groupe avec le nom associé n'existe pas
      if (
        !(await prisma.groupes.findUnique({
          where: { GroupName: grpName },
        }))
      ) {
        return res.status(404).json({
          status: "Grp_Error",
          message: "Group didn't existing",
        });
      }

      // Supression du groupe dans la DB
      await prisma.groupes.delete({
        where: { GroupName: grpName },
      });

      return res.status(200).json({
        status: "Success",
        message: "Group succesfully deleted",
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
  AddGroup,
  EditGroup,
  DeleteGroup,
};
