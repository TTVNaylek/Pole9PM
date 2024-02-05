"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const ServerModule_1 = require("../ServerModule");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs = __importStar(require("fs"));
//Récupère la clé privée
const privatePem = fs.readFileSync("./key.pem");
//Fonction de connexion de l'utilisateur
const LoginUser = async (req, res, next) => {
    //Bloc try-catch pour capturer une erreur si une se produit
    try {
        //Récupère e-mail & mot de passe du formulaire de la page web
        const { email, password } = req.body;
        //Vérifie si un compte existe avec l'e-mail dans la database
        const user = await ServerModule_1.prisma.user.findUnique({ where: { email: email } });
        //Condition pour vérifier qu'un compte avec le mail associé existe
        if (!user) {
            return res.status(404).json({
                status: "Email_Error",
                message: "Incorrect e-mail"
            });
        }
        //Le mot de passe entré dans le formulaire est chiffré
        const formPasswHashed = crypto_1.default.createHash("sha512").update(password + user.salt).digest("hex");
        //Si le MDP de l'utilisateur est incorrect une erreur est renvoyée
        if (user.password !== formPasswHashed) {
            return res.status(400).json({
                status: "Passw_Error",
                message: "Incorrect password",
            });
        }
        //Création du token utilisateur
        let userInfos = { id: user.id, name: user.name, email: user.email };
        const webToken = jsonwebtoken_1.default.sign(userInfos, privatePem, { algorithm: "RS256", issuer: "p9pm", subject: user.id });
        ServerModule_1.prisma.userToken.create({ data: { userID: user.id, token: webToken } });
        //Si toutes les informations sont bonnes alors le token et les infos utilisateur sont envoyés en réponse
        res.status(200).json({
            status: "Success",
            token: webToken,
            user: userInfos
        });
        //En cas d'erreur un message est retourné au serveur
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Server Error"
        });
    }
};
const validateWebToken = (token) => {
    //Vérifie si le token n'est pas usurpé avec la public key
    try {
        jsonwebtoken_1.default.verify(token, fs.readFileSync("./public.pem"));
        return true;
    }
    catch (error) {
        return false;
    }
};
const AddUserAccount = async (req, res, next) => {
};
//Exporte les fonctions pour auth.route
exports.default = {
    LoginUser,
    AddUserAccount,
    //GenerateOTP,
    //VerifyOTP,
    //ValidateOTP,
    //DisableOTP,
};
