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
//Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 80;
const app = (0, express_1.default)();
//Lors de la réception de la requête, cela affiche "Server ON" sur la page web
app.get('/', (req, res) => {
    res.send('Server ON');
});
//Écoute sur le port 80 le serveur web
app.listen(PORT, () => {
    console.log(`App is listenting on port ${PORT}`);
});
