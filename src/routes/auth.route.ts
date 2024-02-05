//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

import express from "express";
import authController from "../controllers/auth.controller";

const router = express.Router();

//Routes pour les requêtes de l'API REST

//Connexion
router.post("/auth/login", authController.LoginUser);

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
//router.post("/p9pm_ad/apass_generator", authController.);
//router.post("/p9pm_ad/dashboard", authController.);
//router.post("/p9pm_ad/history", authController.);
router.post("/auth/add_account", authController.AddUserAccount);

export default router;
