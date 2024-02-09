//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.3

import express from "express";
import authController from "../controllers/auth.controller";
import otpSystem from "../controllers/otpSystem";

const router = express.Router();

//Routes pour les requêtes de l'API REST

//Connexion
router.post("/auth/login", authController.LoginUser);

//A2F
router.post("/otp/generate", otpSystem.GenerateOTP);
//router.post("/otp/verify", authController.VerifyOTP);
//router.post("/otp/validate", authController.ValidateOTP);
//router.post("/otp/disable", authController.DisableOTP);

//Autres
//router.post("/p9pm/services_list", authController.);
//router.post("/p9pm/settings", authController.);
//router.post("/p9pm/logout", authController.);

//Admin
//router.post("/admin/pass_generator", authController.);
//router.post("/admin/dashboard", authController.);
//router.post("/admin/history", authController.);
router.post("/auth/add_account", authController.AddUserAccount);
router.patch("/auth/edit_account", authController.EditUserAccount);
router.delete("/auth/delete_account", authController.DeleteUserAccount);

export default router;
