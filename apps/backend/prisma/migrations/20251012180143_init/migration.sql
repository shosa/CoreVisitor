-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` ENUM('ADMIN', 'RECEPTIONIST', 'EMPLOYEE', 'USER') NOT NULL DEFAULT 'USER',
    `phone` VARCHAR(20) NULL,
    `department` VARCHAR(100) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitors` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `company` VARCHAR(200) NULL,
    `documentType` ENUM('CARTA_IDENTITA', 'PATENTE', 'PASSAPORTO', 'ALTRO') NULL,
    `documentNumber` VARCHAR(50) NULL,
    `documentScanPath` VARCHAR(500) NULL,
    `licensePlate` VARCHAR(20) NULL,
    `photoPath` VARCHAR(500) NULL,
    `privacyConsent` BOOLEAN NOT NULL DEFAULT false,
    `privacyConsentDate` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `visitors_email_idx`(`email`),
    INDEX `visitors_lastName_firstName_idx`(`lastName`, `firstName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visits` (
    `id` VARCHAR(191) NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `hostId` VARCHAR(191) NOT NULL,
    `purpose` ENUM('RIUNIONE', 'CONSEGNA', 'MANUTENZIONE', 'COLLOQUIO', 'FORMAZIONE', 'AUDIT', 'ALTRO') NOT NULL,
    `purposeNotes` TEXT NULL,
    `department` VARCHAR(100) NULL,
    `area` VARCHAR(100) NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `scheduledEndDate` DATETIME(3) NULL,
    `checkInTime` DATETIME(3) NULL,
    `checkOutTime` DATETIME(3) NULL,
    `status` ENUM('SCHEDULED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'SCHEDULED',
    `badgeNumber` VARCHAR(50) NULL,
    `badgeQRCode` TEXT NULL,
    `badgeIssued` BOOLEAN NOT NULL DEFAULT false,
    `badgeIssuedAt` DATETIME(3) NULL,
    `notificationSent` BOOLEAN NOT NULL DEFAULT false,
    `notificationSentAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `visits_badgeNumber_key`(`badgeNumber`),
    INDEX `visits_visitorId_idx`(`visitorId`),
    INDEX `visits_hostId_idx`(`hostId`),
    INDEX `visits_status_idx`(`status`),
    INDEX `visits_scheduledDate_idx`(`scheduledDate`),
    INDEX `visits_checkInTime_idx`(`checkInTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailEnabled` BOOLEAN NOT NULL DEFAULT false,
    `pushEnabled` BOOLEAN NOT NULL DEFAULT false,
    `onVisitorArrival` BOOLEAN NOT NULL DEFAULT true,
    `onVisitScheduled` BOOLEAN NOT NULL DEFAULT true,
    `reminderBefore` INTEGER NOT NULL DEFAULT 30,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `floor` INTEGER NULL,
    `area` VARCHAR(100) NULL,
    `color` VARCHAR(7) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_hostId_fkey` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visits` ADD CONSTRAINT `visits_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
