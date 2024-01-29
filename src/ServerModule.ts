//Titre: Index
//Description : Module pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

//Import des dépendaces requises
import express, {Application, NextFunction, Request, Response} from "express";
//Test DB & Prisma
import {PrismaClient} from "@prisma/client";
import http from "http";
//Test DB & Prisma
export const prisma = new PrismaClient();

//Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 80;
const HOST = "172.17.50.129";
const app = express();

//Test DB & Prisma
async function main() {

  // ... you will write your Prisma Client queries here

}

//Lors de la réception de la requête, cela affiche "Server ON" sur la page web
app.get('/', (req: Request, res: Response) => {
    res.send('Server ON');
});

//Traitement en cas d'erreur sur le serveur
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Error on express server");
});


//Service HTTP
const httpServer = http.createServer((req, res)=>{
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.end("Functionnal test");
});
  
//Écoute sur le port 80 le serveur web
app.listen(PORT, HOST, () => {
    console.log(`App is listenting on port ${HOST}:${PORT}`)
});

//Test DB & Prisma
main().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });