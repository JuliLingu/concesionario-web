-- Bandeja unificada: un contacto por email, con sus pedidos y notas internas.
--
-- Todo lo de este archivo agrega: tablas nuevas, columnas nulas y filas en la
-- tabla nueva. No se borra ni se modifica ningún dato que ya existiera; lo
-- único que se escribe en las tablas de pedidos es la columna nueva
-- `contactoId`. Sin FOREIGN KEY: el datasource usa `relationMode = "prisma"`.

-- AlterTable
ALTER TABLE `consultas` ADD COLUMN `contactoId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `tasaciones` ADD COLUMN `contactoId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `solicitudes_financiacion` ADD COLUMN `contactoId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `contactos` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `contactos_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notas_contacto` (
    `id` VARCHAR(191) NOT NULL,
    `contactoId` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `autor` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notas_contacto_contactoId_createdAt_idx`(`contactoId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `consultas_contactoId_idx` ON `consultas`(`contactoId`);

-- CreateIndex
CREATE INDEX `tasaciones_contactoId_idx` ON `tasaciones`(`contactoId`);

-- CreateIndex
CREATE INDEX `solicitudes_financiacion_contactoId_idx` ON `solicitudes_financiacion`(`contactoId`);

-- Backfill: un contacto por cada email que ya escribió.
--
-- El email se normaliza igual que en `lib/contacto.ts` (sin espacios, en
-- minúsculas). Nombre y teléfono salen del pedido más reciente que tenga
-- teléfono —el más probable de seguir vigente—, y la fecha de alta es la del
-- primer pedido. El id no es un cuid sino un UUID con prefijo: Prisma lo trata
-- como texto, y la base no tiene cómo generar un cuid.
INSERT INTO `contactos` (`id`, `email`, `nombre`, `telefono`, `createdAt`, `updatedAt`)
SELECT CONCAT('c', REPLACE(UUID(), '-', '')), `email`, `nombre`, `telefono`, `primero`, CURRENT_TIMESTAMP(3)
FROM (
    SELECT
        `email`,
        `nombre`,
        `telefono`,
        MIN(`createdAt`) OVER (PARTITION BY `email`) AS `primero`,
        ROW_NUMBER() OVER (
            PARTITION BY `email`
            ORDER BY (`telefono` IS NULL), `createdAt` DESC
        ) AS `orden`
    FROM (
        SELECT LOWER(TRIM(`email`)) AS `email`, `nombre`, NULLIF(TRIM(`telefono`), '') AS `telefono`, `createdAt`
        FROM `consultas`
        UNION ALL
        SELECT LOWER(TRIM(`email`)), `nombre`, NULLIF(TRIM(`telefono`), ''), `createdAt`
        FROM `tasaciones`
        UNION ALL
        SELECT LOWER(TRIM(`email`)), CONCAT(`nombre`, ' ', `apellido`), NULLIF(TRIM(`telefono`), ''), `createdAt`
        FROM `solicitudes_financiacion`
    ) AS `todos`
    WHERE `email` <> ''
) AS `ordenados`
WHERE `orden` = 1;

-- Enlaza cada pedido existente con su contacto. SQL directo, así que no toca
-- `updatedAt`: los pedidos no aparecen como "modificados" por la migración.
UPDATE `consultas` AS `p`
JOIN `contactos` AS `c` ON `c`.`email` = LOWER(TRIM(`p`.`email`))
SET `p`.`contactoId` = `c`.`id`;

UPDATE `tasaciones` AS `p`
JOIN `contactos` AS `c` ON `c`.`email` = LOWER(TRIM(`p`.`email`))
SET `p`.`contactoId` = `c`.`id`;

UPDATE `solicitudes_financiacion` AS `p`
JOIN `contactos` AS `c` ON `c`.`email` = LOWER(TRIM(`p`.`email`))
SET `p`.`contactoId` = `c`.`id`;
