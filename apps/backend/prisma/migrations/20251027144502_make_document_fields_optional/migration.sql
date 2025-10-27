-- AlterTable
ALTER TABLE `visitors` MODIFY `document_type` ENUM('id_card', 'passport', 'driving_license', 'other') NULL,
    MODIFY `document_number` VARCHAR(191) NULL;
