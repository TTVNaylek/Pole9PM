"use strict";
//Titre: Index
//Description : Module pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Import des dépendaces requises
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
//Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 80;
const HOST = "172.17.50.129";
const app = (0, express_1.default)();
//Lors de la réception de la requête, cela affiche "Server ON" sur la page web
app.get('/', (req, res) => {
    res.send('Server ON');
});
//Traitement en cas d'erreur sur le serveur
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Error on express server");
});
//Service HTTP
const httpServer = http_1.default.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Functionnal test");
});
//Écoute sur le port 80 le serveur web
app.listen(PORT, HOST, () => {
    console.log(`App is listenting on port ${HOST}:${PORT}`);
});
