-- AlterTable
-- Sin backfill a propósito. Las unidades ya marcadas VENDIDO tienen `updatedAt`,
-- que es lo más parecido a una fecha de venta que hay en la base, pero es la
-- fecha de la última edición: una unidad vendida en marzo y retocada ayer daría
-- "vendida en un día" y ensuciaría el promedio de rotación con un número
-- inventado. La rotación arranca vacía y se llena con las ventas reales.
ALTER TABLE `vehiculos` ADD COLUMN `vendidoAt` DATETIME(3) NULL;

-- CreateTable
-- Sin FOREIGN KEY: el datasource usa `relationMode = "prisma"`, así que la
-- integridad referencial la resuelve el cliente y en la base solo van los
-- índices. Es como está declarado el resto del esquema.
--
-- La clave primaria compuesta (unidad, día) es la que hace que contar una visita
-- sea un INSERT ... ON DUPLICATE KEY UPDATE sobre una fila que ya existe, en vez
-- de una fila nueva por visita.
CREATE TABLE `metricas_vehiculo_dia` (
    `vehiculoId` VARCHAR(191) NOT NULL,
    `fecha` DATE NOT NULL,
    `vistas` INTEGER NOT NULL DEFAULT 0,
    `clicksWhatsapp` INTEGER NOT NULL DEFAULT 0,

    INDEX `metricas_vehiculo_dia_fecha_idx`(`fecha`),
    PRIMARY KEY (`vehiculoId`, `fecha`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
