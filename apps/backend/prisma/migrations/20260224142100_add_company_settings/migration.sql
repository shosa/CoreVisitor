/*
  Warnings:

  - You are about to drop the column `photo_path` on the `visitors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `visitors` DROP COLUMN `photo_path`;

-- CreateTable
CREATE TABLE `company_settings` (
    `id` VARCHAR(191) NOT NULL,
    `company_name` VARCHAR(200) NOT NULL,
    `gdpr_pdf_path` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
