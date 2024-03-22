//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.6

import express from "express";
import authController from "../controllers/auth.controller";
import adminServices from "../controllers/admin.services";
import authOtpSystem from "../controllers/auth.otpSystem";
import adminGroupes from "../controllers/admin.groupes";
import userActions from "../controllers/user.actions";

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
router.get("/p9pm/receive_los", userActions.SendLOS);
//router.post("/p9pm/settings", .);

//Admin
//router.post("/admin/dashboard", .);
//router.post("/admin/history", .);

router.post("/p9pm_admin/add_service", adminServices.AddService);
router.patch("/p9pm_admin/edit_service", adminServices.EditService);
router.delete("/p9pm_admin/delete_service", adminServices.DeleteService);
router.post("/p9pm_admin/link_service", adminServices.LinkGroupeService);

//Gestion des comptes
router.post("/p9pm_admin/add_account", authController.AddUserAccount);
router.patch("/p9pm_admin/edit_account", authController.EditUserAccount);
router.delete("/p9pm_admin/delete_account", authController.DeleteUserAccount);

//Gestion des groupes
router.post("/p9pm_admin/add_group", adminGroupes.AddGroup);
router.patch("/p9pm_admin/edit_group", adminGroupes.EditGroup);
router.delete("/p9pm_admin/delete_group", adminGroupes.DeleteGroup);
export default router;
