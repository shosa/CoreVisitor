-- AlterTable hosts: replace text department column with FK to departments
ALTER TABLE `hosts` ADD COLUMN `department_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `hosts` ADD CONSTRAINT `hosts_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- DropColumn (after FK is set up)
ALTER TABLE `hosts` DROP COLUMN `department`;
