"use strict";
//Titre: Auth Routes
//Description : Module de routes pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.6
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const admin_services_1 = __importDefault(require("../controllers/admin.services"));
const auth_otpSystem_1 = __importDefault(require("../controllers/auth.otpSystem"));
const admin_groupes_1 = __importDefault(require("../controllers/admin.groupes"));
const user_actions_1 = __importDefault(require("../controllers/user.actions"));
const router = express_1.default.Router();
//Routes pour les requêtes de l'API REST
//Authentification
router.post("/auth/login", auth_controller_1.default.LoginUser);
router.delete("/auth/logout", auth_controller_1.default.Logout);
//A2F
router.post("/otp/generate", auth_otpSystem_1.default.GenerateOTP);
router.post("/otp/verify", auth_otpSystem_1.default.VerifyOTP);
router.post("/otp/validate", auth_otpSystem_1.default.ValidateOTP);
router.post("/otp/disable", auth_otpSystem_1.default.DisableOTP);
//Autres
router.get("/p9pm/receive_los", user_actions_1.default.SendLOS);
//router.post("/p9pm/settings", .);
//Admin
//router.post("/admin/dashboard", .);
//router.post("/admin/history", .);
router.post("/p9pm_admin/add_service", admin_services_1.default.AddService);
router.patch("/p9pm_admin/edit_service", admin_services_1.default.EditService);
router.delete("/p9pm_admin/delete_service", admin_services_1.default.DeleteService);
router.post("/p9pm_admin/link_service", admin_services_1.default.LinkGroupeService);
//Gestion des comptes
router.post("/p9pm_admin/add_account", auth_controller_1.default.AddUserAccount);
router.patch("/p9pm_admin/edit_account", auth_controller_1.default.EditUserAccount);
router.delete("/p9pm_admin/delete_account", auth_controller_1.default.DeleteUserAccount);
//Gestion des groupes
router.post("/p9pm_admin/add_group", admin_groupes_1.default.AddGroup);
router.patch("/p9pm_admin/edit_group", admin_groupes_1.default.EditGroup);
router.delete("/p9pm_admin/delete_group", admin_groupes_1.default.DeleteGroup);
exports.default = router;
