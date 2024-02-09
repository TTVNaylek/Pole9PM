"use strict";
//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.3
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const otpSystem_1 = __importDefault(require("../controllers/otpSystem"));
const router = express_1.default.Router();
//Routes pour les requêtes de l'API REST
//Connexion
router.post("/auth/login", auth_controller_1.default.LoginUser);
//A2F
router.post("/otp/generate", otpSystem_1.default.GenerateOTP);
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
router.post("/auth/add_account", auth_controller_1.default.AddUserAccount);
router.patch("/auth/edit_account", auth_controller_1.default.EditUserAccount);
router.delete("/auth/delete_account", auth_controller_1.default.DeleteUserAccount);
exports.default = router;
