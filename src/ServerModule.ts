//Titre: Index
//Description : Module pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1

//Import des dépendaces requises
import express, {Application, Request, Response} from "express";

//Déclarations des constantes nécessaires au fonctionnement du serveur web
const PORT = 80;
const app = express();

//Lors de la réception de la requête, cela affiche "Server ON" sur la page web
app.get('/', (req: Request, res: Response) => {
    res.send('Server ON');
  });
  
//Écoute sur le port 80 le serveur web
app.listen(PORT, () => {
    console.log(`App is listenting on port ${PORT}`)
  })