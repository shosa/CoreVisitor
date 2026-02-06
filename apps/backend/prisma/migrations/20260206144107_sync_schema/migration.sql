/*
  Warnings:

  - The values [rejected] on the enum `visits_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `visits` MODIFY `status` ENUM('pending', 'approved', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'pending';
