//Titre: Server Module
//Description : Module serveur pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.3

//Import des dépendaces requises
import { PrismaClient } from "@prisma/client";
import express, { Application, NextFunction, Request, Response } from "express";
import http from "http";
import authRouter from "./routes/auth.route";

//Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 80;
const HOST = "localhost";
const app: Application = express();
export const prisma = new PrismaClient();

//Texte à la racine de l'API / simple description
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    author: "Naylek_",
    version: "0.0.3",
    description: "API for Pole 9 Association by Kelyan Desmet",
    message: "Bienvenue sur le gestionnaire de mots de passe de Pole 9",
  });
});

app.use("/api", authRouter);

//Envoie un message si une erreur est détectée
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Error on express server");
});

//Service http
const httpServer = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Functionnal test");
});

//Le serveur web écoute sur le host:port
app.listen(PORT, HOST, () => {
  console.log(`App is listenting on port ${HOST}:${PORT}/`);
});
