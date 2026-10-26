-- AlterTable
-- Nulas a propósito: ninguna unidad existente tiene una baja registrada, y no
-- se le inventa un precio anterior que nadie puede respaldar.
ALTER TABLE `vehiculos`
    ADD COLUMN `precioAnterior` DECIMAL(12, 2) NULL,
    ADD COLUMN `precioBajoAt` DATETIME(3) NULL;

-- CreateTable
-- Sin FOREIGN KEY: el datasource usa `relationMode = "prisma"`. El borrado en
-- cascada al dar de baja una unidad lo hace Prisma.
CREATE TABLE `cambios_precio` (
    `id` VARCHAR(191) NOT NULL,
    `vehiculoId` VARCHAR(191) NOT NULL,
    `precioAnterior` DECIMAL(12, 2) NOT NULL,
    `monedaAnterior` ENUM('ARS', 'USD') NOT NULL,
    `precioNuevo` DECIMAL(12, 2) NOT NULL,
    `monedaNueva` ENUM('ARS', 'USD') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cambios_precio_vehiculoId_createdAt_idx`(`vehiculoId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
