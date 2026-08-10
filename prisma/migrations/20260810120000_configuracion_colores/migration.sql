-- AlterTable
ALTER TABLE `configuraciones`
    ADD COLUMN `colorPrimario` VARCHAR(7) NULL,
    ADD COLUMN `colorAcento` VARCHAR(7) NULL,
    ADD COLUMN `colorFondo` VARCHAR(7) NULL,
    ADD COLUMN `colorSuperficie` VARCHAR(7) NULL,
    ADD COLUMN `colorTexto` VARCHAR(7) NULL,
    ADD COLUMN `colorTextoSuave` VARCHAR(7) NULL,
    ADD COLUMN `colorTextoSobrePrimario` VARCHAR(7) NULL;
