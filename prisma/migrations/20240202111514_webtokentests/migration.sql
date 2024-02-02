/*
  Warnings:

  - Added the required column `salt` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "salt" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "userToken" (
    "Id" TEXT NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "userToken_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userToken_userID_key" ON "userToken"("userID");

-- AddForeignKey
ALTER TABLE "userToken" ADD CONSTRAINT "userToken_userID_fkey" FOREIGN KEY ("userID") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
