-- AlterTable
ALTER TABLE `configuraciones`
  ADD COLUMN `tasacionActiva` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `tasacionEyebrow` VARCHAR(191) NULL,
  ADD COLUMN `tasacionTitulo` TEXT NULL,
  ADD COLUMN `tasacionTexto` TEXT NULL,
  ADD COLUMN `tasacionCtaTexto` VARCHAR(191) NULL;
