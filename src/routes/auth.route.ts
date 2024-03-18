//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.5

import express from "express";
import authController from "../controllers/auth.controller";
import adminServices from "../controllers/admin.services";
import authOtpSystem from "../controllers/auth.otpSystem";
import adminGroupe from "../controllers/admin.groupes";
import adminGroupes from "../controllers/admin.groupes";

const router = express.Router();

//Routes pour les requêtes de l'API REST

//Authentification
router.post("/auth/login", authController.LoginUser);
router.delete("/auth/logout", authController.Logout);

//A2F
router.post("/otp/generate", authOtpSystem.GenerateOTP);
router.post("/otp/verify", authOtpSystem.VerifyOTP);
router.post("/otp/validate", authOtpSystem.ValidateOTP);
router.post("/otp/disable", authOtpSystem.DisableOTP);

//Autres
//router.post("/p9pm/services_list", authController.);
//router.post("/p9pm/settings", authController.);

//Admin
//router.post("/admin/pass_generator", authController.);
//router.post("/admin/dashboard", authController.);
//router.post("/admin/history", authController.);

router.post("/p9pm_admin/add_service", adminServices.AddService);
router.patch("/p9pm_admin/edit_service", adminServices.EditService);
router.delete("/p9pm_admin/delete_service", adminServices.DeleteService);

//Gestion des comptes
router.post("/auth/add_account", authController.AddUserAccount);
router.patch("/auth/edit_account", authController.EditUserAccount);
router.delete("/auth/delete_account", authController.DeleteUserAccount);

//Gestion des groupes
router.post("/group/add_group", adminGroupes.AddGroup);
router.patch("/group/edit_group", adminGroupes.EditGroup);
router.delete("/group/delete_group", adminGroupes.DeleteGroup);
export default router;
