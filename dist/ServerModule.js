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
// Import des dépendaces requises
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const auth_permVerification_1 = __importDefault(require("./controllers/auth.permVerification"));
const cors_1 = __importDefault(require("cors"));
// Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 443;
const HOST = "172.17.50.129";
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
//Liste d'origines autorisées SEULEMENT DEBUG
const allowedOrigins = [
    "172.17.50.133", // L'adresse IP d'où vous pensez que la requête devrait venir
    "http://localhost:5173/", // L'adresse locale avec le port que vous utilisez
    "http://127.0.0.1:5173/", // L'adresse de bouclage (loopback) avec le port
];
const options = {
    origin: allowedOrigins,
};
//Affiche les requêtes HTTP
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
app.get("/", (req, res) => {
    res.status(200).json({
        author: "Naylek_",
        version: "0.4",
        description: "API for Pole 9 Association by Kelyan Desmet",
        message: "Bienvenue sur le gestionnaire de mots de passe de Pole 9",
    });
});
// Envoie un message si une erreur est détectée
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Error on express server");
});
// Le serveur web écoute sur le host:port
app.listen(PORT, HOST, () => {
    console.log(`App is listening on ${HOST}:${PORT}`);
});
