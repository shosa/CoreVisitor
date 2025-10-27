-- Rename visitType to visit_type
ALTER TABLE `visits` CHANGE COLUMN `visitType` `visit_type` ENUM('business', 'personal', 'delivery', 'maintenance', 'interview', 'other') NOT NULL DEFAULT 'business';
