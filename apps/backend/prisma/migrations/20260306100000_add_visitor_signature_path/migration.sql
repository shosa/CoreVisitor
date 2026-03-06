-- AlterTable: add signature_path to visitors
ALTER TABLE `visitors` ADD COLUMN `signature_path` VARCHAR(191) NULL;
