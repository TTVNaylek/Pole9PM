"use strict";
//Titre: Server Module
//Description : Module serveur pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.3
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
//Import des dépendaces requises
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
//Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 80;
const HOST = "localhost";
const app = (0, express_1.default)();
exports.prisma = new client_1.PrismaClient();
//Middleware express
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
//Route de l'API
app.use("/api", auth_route_1.default);
//Texte à la racine de l'API / simple description
app.get("/", (req, res) => {
    res.status(200).json({
        author: "Naylek_",
        version: "0.0.3",
        description: "API for Pole 9 Association by Kelyan Desmet",
        message: "Bienvenue sur le gestionnaire de mots de passe de Pole 9",
    });
});
//Envoie un message si une erreur est détectée
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Error on express server");
});
//Service http
const httpServer = http_1.default.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Functionnal test");
});
//Le serveur web écoute sur le host:port
app.listen(PORT, HOST, () => {
    console.log(`App is listenting on port ${HOST}:${PORT}/`);
});
