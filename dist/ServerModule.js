"use strict";
//Titre: Server Module
//Description : Module serveur pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.5
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
//Import des dépendaces requises
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const auth_permVerification_1 = __importDefault(require("./controllers/auth.permVerification"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Chemin du fichier de logs
const logFilePath = path_1.default.join(__dirname, "..", "logs", "server.log");
// Création du flux d'écriture pour le fichier de logs
const logStream = (0, fs_1.createWriteStream)(logFilePath, { flags: "a" });
// Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 443;
const HOST = "172.17.50.129";
const app = (0, express_1.default)();
//Utilisation de Morgan avec le flux d'écriture
app.use((0, morgan_1.default)("combined", { stream: logStream }));
app.use((0, morgan_1.default)("combined"));
//Cookies de session
app.use((0, cookie_parser_1.default)());
//CORS
app.use((0, cors_1.default)({ origin: true, credentials: true }));
//Middleware express
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
//Middleware de permissions
app.use(auth_permVerification_1.default.checkCurrentUser);
//Route de l'API
app.use("/api", auth_route_1.default);
// Texte à la racine de l'API / simple description
app.get("/", (res) => {
    res.status(200).json({
        author: "Naylek_",
        version: "0.4",
        description: "API for Pole 9 Association by Kelyan Desmet",
        message: "Bienvenue sur le gestionnaire de mots de passe de Pole 9",
    });
});
// Envoie un message si une erreur est détectée
app.use((err, req, res) => {
    console.error(err.stack);
    res.status(500).send("Error on express server");
});
// Le serveur web écoute sur le host:port
app.listen(PORT, HOST, () => {
    console.log(`App is listening on ${HOST}:${PORT}`);
});
//Export de prisma pour l'utiliser dans les autres modules
exports.prisma = new client_1.PrismaClient();
