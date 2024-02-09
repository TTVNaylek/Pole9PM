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
const ServerModule_1 = require("../ServerModule");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs = __importStar(require("fs"));
//Récupère les clés privé et public
const privatePem = fs.readFileSync("./key.pem");
const publicPem = fs.readFileSync("./public.pem");
//Fonction permettant de valider le webtoken de l'utilisateur
const validateWebToken = async (token) => {
    try {
        //Vérifie que le token est bien présent dans la DB
        const dbToken = await ServerModule_1.prisma.userToken.findFirst({
            where: { token: token },
        });
        //S'il n'est pas présent on s'arrete ici
        if (!dbToken) {
            return null;
        }
        //Vérifie si le token n'est pas usurpé avec la public key
        const jwtToken = jsonwebtoken_1.default.verify(token, publicPem);
        //Compare et retourne le token de la DB et celui de l'utilisateur
        return dbToken.userID == jwtToken.sub ? jwtToken.sub : null;
    }
    catch (error) {
        return null;
    }
};
async function checkCurrentUser(req, res) {
    //Récupère le token de l'utilisateur actuel
    const currentUser = await validateWebToken(req.cookies.webTokenCookie);
    //Vérifie si l'utilisateur est connecté
    if (!currentUser) {
        return false;
    }
}
async function checkPermissions(req, res) {
    //Récupère le token de l'utilisateur actuel
    const currentUser = await validateWebToken(req.cookies.webTokenCookie);
    //Vérifie si l'utilisateur est connecté
    if (!currentUser) {
        return false;
    }
    //Vérifie si l'utilisateur existe
    const currentUserData = await ServerModule_1.prisma.user.findUnique({
        where: { id: currentUser },
    });
    //Vérifie si l'utilisateur fait partie du groupe admin, responsable ou pilotage
    if (currentUserData && currentUserData.group === "admin") {
        return "admin";
    }
    else if (currentUserData && currentUserData.group === "resp") {
        return "responsable";
    }
    else if (currentUserData && currentUserData.group === "pilotage") {
        return "piloatge";
    }
    //Sinon on retourne une erreur
    return res.status(401).json({
        status: "Unauthorized",
        message: "Utilisateur non autorisé",
    });
}
exports.default = {
    validateWebToken,
    checkPermissions,
};
