-- CreateTable
CREATE TABLE `printer_configs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'escpos',
    `connection` VARCHAR(191) NOT NULL DEFAULT 'usb',
    `address` VARCHAR(191) NULL,
    `port` INTEGER NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `settings` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `printer_configs_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `print_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('badge', 'report', 'label') NOT NULL DEFAULT 'badge',
    `status` ENUM('pending', 'printing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
    `visit_id` VARCHAR(191) NULL,
    `printer_name` VARCHAR(191) NULL,
    `data` TEXT NOT NULL,
    `template` VARCHAR(191) NULL,
    `copies` INTEGER NOT NULL DEFAULT 1,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `error` TEXT NULL,
    `printed_at` DATETIME(3) NULL,
    `created_by_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `print_jobs_status_idx`(`status`),
    INDEX `print_jobs_visit_id_idx`(`visit_id`),
    INDEX `print_jobs_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
