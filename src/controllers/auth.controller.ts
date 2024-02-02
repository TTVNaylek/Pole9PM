import crypto from "crypto";
import { Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../ServerModule";

//Fonction de connexion de l'utilisateur
const LoginUser =async (req:Request, res: Response, next: NextFunction) => {
    //Bloc try-catch pour capturer une erreur si une se produit
    try {
        //Récupère e-mail & mot de passe du formulaire de la page web
        const {email, password, salt} = req.body;
        //Vérifie si un compte existe avec l'e-mail
        const user = await prisma.user.findUnique({where:{email}});
        //Condition pour vérifier qu'un compte avec le mail associé existe
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "Incorrect e-mail"
            });
        }
        //Le mot de passe entré dans le formulaire est chiffré
        const formPassHashed = crypto.createHash("sha512").update(password + user.salt).digest("hex");
        //Si le MDP de l'utilisateur est incorrect une erreur est renvoyée
        if (user.password !== formPassHashed) {
            return res.status(401).json({
              status: "Login error",
              message: "Incorrect password",
            });
          }
      
          // Si le mot de passe est correct, vous pouvez envoyer une réponse réussie ici
          res.status(200).json({
            status: "Success",
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              // Add other user properties you want to include
            },
          });
    //En cas d'erreur un message est retourné au serveur
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status:"Error",
            message:"Server Error"
        });
    }
};




export default {
    LoginUser,
    //GenerateOTP,
    //VerifyOTP,
    //ValidateOTP,
    //DisableOTP,
  };