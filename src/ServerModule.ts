//Titre: Server Module
//Description : Module serveur pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.5

//Import des dépendaces requises
// Import des dépendaces requises
import { PrismaClient } from "@prisma/client";
import express, { Application, Request, Response } from "express";
import authRouter from "./routes/auth.route";
import cookie from "cookie-parser";
import morgan from "morgan";
import permVerification from "./controllers/auth.permVerification";
import cors from "cors";
import { createWriteStream } from "fs";
import path from "path";

// Chemin du fichier de logs
const logFilePath = path.join(__dirname, "..", "logs", "server.log");
// Création du flux d'écriture pour le fichier de logs
const logStream = createWriteStream(logFilePath, { flags: "a" });

// Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 443;
const HOST = "172.17.50.129";
const app: Application = express();
export const prisma = new PrismaClient();

//Utilisation de Morgan avec le flux d'écriture
app.use(morgan("combined", { stream: logStream }));
app.use(morgan("combined"));
//Cookies de session
app.use(cookie());
//CORS
app.use(cors({ origin: true, credentials: true }));
//Middleware express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//Middleware de permissions
app.use(permVerification.checkCurrentUser);
//Route de l'API
app.use("/api", authRouter);

// Texte à la racine de l'API / simple description
app.get("/", (res: Response) => {
  res.status(200).json({
    author: "Naylek_",
    version: "0.4",
    description: "API for Pole 9 Association by Kelyan Desmet",
    message: "Bienvenue sur le gestionnaire de mots de passe de Pole 9",
  });
});

// Envoie un message si une erreur est détectée
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).send("Error on express server");
});

// Le serveur web écoute sur le host:port
app.listen(PORT, HOST, () => {
  console.log(`App is listening on ${HOST}:${PORT}`);
});
