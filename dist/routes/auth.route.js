"use strict";
//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.5
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const admin_services_1 = __importDefault(require("../controllers/admin.services"));
const auth_otpSystem_1 = __importDefault(require("../controllers/auth.otpSystem"));
const router = express_1.default.Router();
//Routes pour les requêtes de l'API REST
//Connexion
router.post("/auth/login", auth_controller_1.default.LoginUser);
//A2F
router.post("/otp/generate", auth_otpSystem_1.default.GenerateOTP);
router.post("/otp/verify", auth_otpSystem_1.default.VerifyOTP);
router.post("/otp/validate", auth_otpSystem_1.default.ValidateOTP);
router.post("/otp/disable", auth_otpSystem_1.default.DisableOTP);
//Autres
//router.post("/p9pm/services_list", authController.);
//router.post("/p9pm/settings", authController.);
//Admin
//router.post("/admin/pass_generator", authController.);
//router.post("/admin/dashboard", authController.);
//router.post("/admin/history", authController.);
router.post("/p9pm_admin/add_service", admin_services_1.default.AddService);
router.patch("/p9pm_admin/edit_service", admin_services_1.default.EditService);
router.delete("/p9pm_admin/delete_service", admin_services_1.default.DeleteService);
router.post("/auth/add_account", auth_controller_1.default.AddUserAccount);
router.patch("/auth/edit_account", auth_controller_1.default.EditUserAccount);
router.delete("/auth/delete_account", auth_controller_1.default.DeleteUserAccount);
router.delete("/auth/logout", auth_controller_1.default.Logout);
exports.default = router;
