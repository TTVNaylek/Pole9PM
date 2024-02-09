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
const publicPem = fs.readFileSync("./public.pem");
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
                message: "Incorrect e-mail",
            });
        }
        //Le mot de passe entré dans le formulaire est chiffré
        //const formPasswHashed = crypto
        // .createHash("sha512")
        //  .update(password + user.salt)
        //  .digest("hex");
        //Si le MDP de l'utilisateur est incorrect une erreur est renvoyée
        //if (user.password !== formPasswHashed) {
        //  return res.status(400).json({
        //    status: "Passw_Error",
        //    message: "Incorrect password",
        //  });
        //}
        //Création du token utilisateur
        let userInfos = {
            id: user.id,
            name: user.name,
            email: user.email,
            group: user.group,
        };
        const webToken = jsonwebtoken_1.default.sign(userInfos, privatePem, {
            algorithm: "RS256",
            issuer: "p9pm",
            subject: user.id,
        });
        //Sauvegarde dans la DB le webToken
        await ServerModule_1.prisma.userToken.create({
            data: {
                userID: user.id,
                token: webToken,
            },
        });
        //Si toutes les informations sont bonnes alors le token et les infos utilisateur sont envoyés en réponse
        res
            .status(200)
            .cookie("webTokenCookie", webToken, {
            httpOnly: true,
            secure: true,
            sameSite: true,
        })
            .json({
            status: "Success",
            token: webToken,
            user: userInfos,
        });
        //En cas d'erreur un message est retourné au serveur
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            status: "Error",
            message: "Server Error",
        });
    }
};
//Fonction pour ajouter un nouvel utilisateur
//FONCTION ADMIN
const AddUserAccount = async (req, res, next) => {
    //Récupère le token de l'utilisateur actuel
    const currentUser = await validateWebToken(req.cookies.webTokenCookie);
    console.log(currentUser);
    //Condition qui vérifie que l'utilisateur est bien connecté
    if (currentUser) {
        try {
            // Vérifier si l'utilisateur est dans le groupe admin
            const currentUserData = await ServerModule_1.prisma.user.findUnique({
                where: { id: currentUser },
            });
            if (!currentUserData || currentUserData.group !== "admin") {
                return res.status(401).json({
                    status: "Unauthorized",
                    message: "Utilisateur non autorisé",
                });
            }
            //Récupère les informations de l'utilisateur qui va être inscrit
            const { userName, userEmail, userPassword, userGroup } = req.body;
            console.log(userName + " " + userEmail + " " + userPassword + " " + userGroup);
            //Vérifie si l'email est défini et n'est pas vide
            if (!userEmail) {
                return res.status(400).json({
                    status: "No_Email",
                    message: "L'email de l'utilisateur est manquant ou vide",
                });
            }
            //Condition pour vérifier qu'un compte avec le mail associé n'existe pas
            if (await ServerModule_1.prisma.user.findUnique({
                where: { email: userEmail },
            })) {
                return res.status(404).json({
                    status: "User_Error",
                    message: "User already exist",
                });
            }
            //Création du salt de l'utilisateur
            const userSalt = crypto_1.default.randomBytes(32).toString();
            //Le mot de passe entré dans le formulaire est chiffré + salé
            const userPasswHashed = crypto_1.default
                .createHash("sha512")
                .update(userPassword + userSalt)
                .digest("hex");
            //Création l'utilisateur dans la DB
            await ServerModule_1.prisma.user.create({
                data: {
                    name: userName,
                    email: userEmail,
                    password: userPasswHashed,
                    salt: userSalt,
                    group: userGroup,
                },
            });
            //En cas d'erreur un message est retourné au serveur
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                status: "Error",
                message: "Server Error",
            });
        }
    }
    else {
        res.status(401).json({
            status: "Unauthorized",
            message: "Utilisateur non autorisé",
        });
    }
};
//Fonction permettant de modifier le compte de l'utilisateur
//FONCTION ADMIN
const EditUserAccount = async (req, res, next) => {
    var _a;
    //Récupère le token de l'utilisateur actuel
    const currentUser = await validateWebToken(req.cookies.webTokenCookie);
    console.log("Valeur de currentUser:" + currentUser);
    //Condition qui vérifie que l'utilisateur est bien connecté
    if (currentUser) {
        try {
            // Vérifie si l'utilisateur est dans le groupe admin
            if (((_a = (await ServerModule_1.prisma.user.findUnique({ where: { id: currentUser } }))) === null || _a === void 0 ? void 0 : _a.group) === "admin") {
                return res.status(401).json({
                    status: "Unauthorized",
                    message: "Utilisateur non autorisé",
                });
            }
            //Récupère les informations de l'utilisateur qui va être modifié
            const { userName, currentUserEmail, newUserEmail, userPassword, userGroup, } = req.body;
            //Vérifie si un compte existe avec l'e-mail dans la database
            const user = await ServerModule_1.prisma.user.findUnique({
                where: { email: currentUserEmail },
            });
            //Condition qui vérifie qu'un compte avec le mail associé existe
            if (!user) {
                return res.status(404).json({
                    status: "User_Error",
                    message: "User doesn't exist",
                });
            }
            //
            //Création du nouveau salt de l'utilisateur
            const userSalt = crypto_1.default.randomBytes(32).toString();
            //Le mot de passe entré dans le formulaire est chiffré + salé
            const userPasswHashed = crypto_1.default
                .createHash("sha512")
                .update(userPassword + userSalt)
                .digest("hex");
            //Modification des données l'utilisateur dans la DB
            await ServerModule_1.prisma.user.update({
                where: { email: currentUserEmail },
                data: {
                    name: userName,
                    email: newUserEmail,
                    password: userPasswHashed,
                    group: userGroup,
                    salt: userSalt,
                },
            });
            //En cas d'erreur un message est retourné au serveur
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                status: "Error",
                message: "Server Error",
            });
        }
    }
    else {
        res.status(401).json({
            status: "Unauthorized",
            message: "Utilisateur non autorisé",
        });
    }
};
//Fonction permettant de supprimer le compte de l'utilisateur
//FONCTION ADMIN
const DeleteUserAccount = async (req, res) => {
    var _a;
    //Récupère le token de l'utilisateur actuel
    const currentUser = await validateWebToken(req.cookies.webTokenCookie);
    //Condition qui vérifie que l'utilisateur est bien connecté
    if (currentUser) {
        try {
            // Vérifie si l'utilisateur est dans le groupe admin
            if (((_a = (await ServerModule_1.prisma.user.findUnique({ where: { id: currentUser } }))) === null || _a === void 0 ? void 0 : _a.group) === "admin") {
                return res.status(401).json({
                    status: "Unauthorized",
                    message: "Utilisateur non autorisé",
                });
            }
            //Récupère les informations de l'utilisateur qui va être modifié
            const { userName, userEmail, userPassword, userGroup } = req.body;
            //Vérifie si un compte existe avec l'e-mail dans la database
            const user = await ServerModule_1.prisma.user.findUnique({
                where: { email: userEmail },
            });
            //Condition qui vérifie qu'un compte avec le mail associé existe
            if (!user) {
                return res.status(404).json({
                    status: "User_Error",
                    message: "User doesn't exist",
                });
            }
            //Suppression des données l'utilisateur dans la DB
            await ServerModule_1.prisma.user.delete({
                where: { email: userEmail },
            });
            //En cas d'erreur un message est retourné au serveur
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                status: "Error",
                message: "Server Error",
            });
        }
    }
    else {
        res.status(401).json({
            status: "Unauthorized",
            message: "Utilisateur non autorisé",
        });
    }
};
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
//Exporte les fonctions pour auth.route
exports.default = {
    LoginUser,
    AddUserAccount,
    EditUserAccount,
    DeleteUserAccount,
    //GenerateOTP,
    //VerifyOTP,
    //ValidateOTP,
    //DisableOTP,
};
