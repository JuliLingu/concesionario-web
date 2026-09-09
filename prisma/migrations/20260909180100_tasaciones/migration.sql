-- CreateTable
-- Sin FOREIGN KEY: el datasource usa `relationMode = "prisma"`, así que la
-- integridad referencial la resuelve el cliente y en la base solo van los
-- índices. Es como está declarado el resto del esquema.
CREATE TABLE `tasaciones` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `anio` INTEGER NOT NULL,
    `kilometraje` INTEGER NOT NULL,
    `version` VARCHAR(191) NULL,
    `combustible` ENUM('NAFTA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GNC') NULL,
    `transmision` ENUM('MANUAL', 'AUTOMATICA', 'CVT') NULL,
    `precioPretendido` DECIMAL(12, 2) NULL,
    `moneda` ENUM('ARS', 'USD') NOT NULL DEFAULT 'USD',
    `observaciones` TEXT NULL,
    `vehiculoInteresId` VARCHAR(191) NULL,
    `estado` ENUM('PENDIENTE', 'VISTA', 'RESPONDIDA', 'CERRADA') NOT NULL DEFAULT 'PENDIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasaciones_vehiculoInteresId_idx`(`vehiculoInteresId`),
    INDEX `tasaciones_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
