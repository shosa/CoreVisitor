-- AlterTable
ALTER TABLE `visitors` ADD COLUMN `license_plate` VARCHAR(191) NULL,
    ADD COLUMN `privacy_consent` BOOLEAN NOT NULL DEFAULT false;
