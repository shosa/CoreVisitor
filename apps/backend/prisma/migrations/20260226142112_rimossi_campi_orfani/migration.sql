/*
  Warnings:

  - You are about to drop the column `contact_email` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `contact_person` on the `departments` table. All the data in the column will be lost.
  - You are about to drop the column `contact_phone` on the `departments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `departments` DROP COLUMN `contact_email`,
    DROP COLUMN `contact_person`,
    DROP COLUMN `contact_phone`;
