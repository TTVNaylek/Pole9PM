//Titre: OTP System
//Description : Module de l'OTP pour le gestionnaire de mots de passe pour l'association Pole9
//Author: Kelyan D.
//Version 0.1
import crypto from "crypto";
import { Request, Response } from "express";
import { prisma } from "../ServerModule";
import * as OTPAuth from "otpauth";
import { encode } from "hi-base32";

//Fonction qui génère une suite en base 32
const generateRandomBase32 = () => {
  const buffer = crypto.randomBytes(15);
  return encode(buffer).replace(/=/g, "").substring(0, 24);
};

//Fonction permettant de génerer la clé OTP
const GenerateOTP = async (res: Response) => {
  try {
    //Récupère l'utilisateur connecté
    const currentUser = res.locals.principal;
    //Vérifie si l'utilisateur existe dans la DB
    const currentUserData = await prisma.user.findUnique({
      where: { id: currentUser },
    });

    //Condition qui vérifie si l'utilisateur existe dans la DB
    if (!currentUserData) {
      return res.status(404).json({
        status: "Email_Error",
        message: "Utilisateur non existant",
      });
    }

    //Appelle la fonction generateRandomBase32 pour génerer et sauvegarder la clé
    const base32_secret = generateRandomBase32();

    let totp = new OTPAuth.TOTP({
      issuer: "P9PM",
      label: "Author: Kelyan",
      algorithm: "SHA1",
      digits: 6,
      secret: base32_secret,
    });

    let otpauth_url = totp.toString();

    //Met a jour l'utilisateur en rajoutant la clé de base 32 et le fournisseur
    await prisma.user.update({
      where: { id: currentUser },
      data: {
        otp_auth_url: otpauth_url,
        otp_base32: base32_secret,
      },
    });

    res.status(200).json({
      base32: base32_secret,
      otpauth_url,
      status: "Success",
      message: "OTP URL and Key succesfully saved",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Server Error",
    });
  }
};
// Fonction pour récupérer l'utilisateur et vérifier s'il existe
async function getUserAndCheckIfExists(res: Response) {
  // Récupère l'utilisateur connecté
  const currentUser = res.locals.principal;
  // Recherche l'utilisateur dans la DB pour vérifier s'il existe
  const user = await prisma.user.findUnique({ where: { id: currentUser } });
  // Condition qui vérifie si l'utilisateur existe
  if (!user) {
    res.status(401).json({
      status: "Unauthorized",
      message: "otpToken is invalid or user doesn't exist",
    });
    return null;
  }
  return user;
}

//Fonction permettant la vérification de la clé OTP
const VerifyOTP = async (req: Request, res: Response) => {
  try {
    //Récupère le token otp de l'utilisateur
    const { otpToken } = req.body;
    //Récupère l'utilisateur connecté
    const currentUser = res.locals.principal;
    //Recherche l'utilisateur dans la DB pour vérifier s'il existe
    const user = await getUserAndCheckIfExists(res);
    //Condition qui vérifie si l'utilisateur existe
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "otpToken is invalid or user doesn't exist",
      });
    }

    //Informations sur TOTP
    let totp = new OTPAuth.TOTP({
      issuer: "P9PM",
      label: "Author: Kelyan",
      algorithm: "SHA1",
      digits: 6,
      secret: user.otp_base32!,
    });

    //Permet de récupérer la valeur de la fonction validate
    let delta = totp.validate({ token: otpToken });

    if (delta === null) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "otp_token is invalid or user doesn't exist",
      });
    }
    //Met à jour l'utilisateur dans la DB
    const updatedUser = await prisma.user.update({
      where: { id: currentUser },
      data: {
        otp_enabled: true,
        otp_verified: true,
      },
    });

    //MAJ des infos de l'utilisateur dans la DB
    res.status(200).json({
      otp_verified: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        otp_enabled: updatedUser.otp_enabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Server Error",
    });
  }
};

//Fonction pour valider la clé OTP
const ValidateOTP = async (req: Request, res: Response) => {
  try {
    //Récupère le token otp de l'utilisateur
    const { otpToken } = req.body;
    //Recherche l'utilisateur dans la DB pour vérifier s'il existe
    const user = await getUserAndCheckIfExists(res);
    //Condition qui vérifie si l'utilisateur existe
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "otpToken is invalid or user doesn't exist",
      });
    }
    //Information sur TOTP
    let totp = new OTPAuth.TOTP({
      issuer: "P9PM",
      label: "Author: Kelyan",
      algorithm: "SHA1",
      digits: 6,
      secret: user.otp_base32!,
    });
    //Valide le totp token
    let delta = totp.validate({ token: otpToken, window: 1 });
    if (delta === null) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "Token is invalid or user doesn't exist",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "",
      otp_valid: true,
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Server Error",
    });
  }
};

const DisableOTP = async (res: Response) => {
  try {
    //Récupère l'utilisateur connecté
    const currentUser = res.locals.principal;

    //Vérifie si l'utilisateur existe dans la DB
    const user = await prisma.user.findUnique({ where: { id: currentUser } });
    if (!user) {
      return res.status(401).json({
        status: "Unauthorized",
        message: "User doesn't exist",
      });
    }

    //Met à jour l'utilisateur dans la DB
    const updatedUser = await prisma.user.update({
      where: { id: currentUser },
      data: {
        otp_enabled: false,
      },
    });

    res.status(200).json({
      otp_disabled: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        otp_enabled: updatedUser.otp_enabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      message: "Server Error",
    });
  }
};

export default {
  GenerateOTP,
  VerifyOTP,
  ValidateOTP,
  DisableOTP,
};
