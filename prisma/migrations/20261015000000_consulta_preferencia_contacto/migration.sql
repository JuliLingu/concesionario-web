-- AlterTable
-- Columnas nulas a propósito: las consultas anteriores no tienen preferencia
-- de contacto y no se les inventa una.
ALTER TABLE `consultas`
    ADD COLUMN `medioContacto` ENUM('WHATSAPP', 'LLAMADA', 'EMAIL') NULL,
    ADD COLUMN `franjaHoraria` ENUM('MANANA', 'TARDE', 'NOCHE', 'CUALQUIERA') NULL;
