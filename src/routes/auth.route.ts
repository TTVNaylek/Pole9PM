//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

import express from "express";
import authController from "../controllers/auth.controller";

const router = express.Router();


//Routes pour les requêtes de l'API REST

//Connexion
//router.post("/login", authController.LoginUser);

//A2F
//router.post("/otp/generate", authController.GenerateOTP);
//router.post("/otp/verify", authController.VerifyOTP);
//router.post("/otp/validate", authController.ValidateOTP);
//router.post("/otp/disable", authController.DisableOTP);

//Autres
//router.post("/p9pm/services_list", authController.);
//router.post("/p9pm/settings", authController.);
//router.post("/p9pm/logout", authController.);

//Admin
//router.post("/p9pm/pass_generator", authController.);
//router.post("/p9pm/dashboard", authController.);
//router.post("/p9pm/history", authController.);

export default router;