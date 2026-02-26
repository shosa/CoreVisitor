/*
  Warnings:

  - You are about to drop the column `host_user_id` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `qr_code` on the `visits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `visits` DROP FOREIGN KEY `visits_host_user_id_fkey`;

-- AlterTable
ALTER TABLE `visits` DROP COLUMN `host_user_id`,
    DROP COLUMN `qr_code`;
