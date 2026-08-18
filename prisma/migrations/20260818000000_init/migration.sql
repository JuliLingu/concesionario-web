-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_tokens` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verification_tokens_token_key`(`token`),
    UNIQUE INDEX `verification_tokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categorias` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categorias_nombre_key`(`nombre`),
    UNIQUE INDEX `categorias_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehiculos` (
    `id` VARCHAR(191) NOT NULL,
    `categoriaId` VARCHAR(191) NOT NULL,
    `marca` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `anio` INTEGER NOT NULL,
    `version` VARCHAR(191) NULL,
    `estado` ENUM('NUEVO', 'USADO') NOT NULL DEFAULT 'USADO',
    `precio` DECIMAL(12, 2) NOT NULL,
    `moneda` ENUM('ARS', 'USD') NOT NULL DEFAULT 'USD',
    `kilometraje` INTEGER NOT NULL DEFAULT 0,
    `color` VARCHAR(191) NULL,
    `motor` VARCHAR(191) NULL,
    `transmision` ENUM('MANUAL', 'AUTOMATICA', 'CVT') NULL,
    `combustible` ENUM('NAFTA', 'DIESEL', 'ELECTRICO', 'HIBRIDO', 'GNC') NULL,
    `puertas` INTEGER NULL,
    `potencia` INTEGER NULL,
    `descripcion` TEXT NULL,
    `publicacion` ENUM('BORRADOR', 'PUBLICADO', 'VENDIDO', 'PAUSADO') NOT NULL DEFAULT 'BORRADOR',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `vehiculos_categoriaId_idx`(`categoriaId`),
    INDEX `vehiculos_publicacion_idx`(`publicacion`),
    INDEX `vehiculos_marca_modelo_idx`(`marca`, `modelo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `imagenes_vehiculos` (
    `id` VARCHAR(191) NOT NULL,
    `vehiculoId` VARCHAR(191) NOT NULL,
    `url` TEXT NOT NULL,
    `altText` VARCHAR(191) NULL,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `esPrincipal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `imagenes_vehiculos_vehiculoId_idx`(`vehiculoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultas` (
    `id` VARCHAR(191) NOT NULL,
    `vehiculoId` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `mensaje` TEXT NULL,
    `estado` ENUM('PENDIENTE', 'VISTA', 'RESPONDIDA', 'CERRADA') NOT NULL DEFAULT 'PENDIENTE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `consultas_vehiculoId_idx`(`vehiculoId`),
    INDEX `consultas_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configuraciones` (
    `id` VARCHAR(191) NOT NULL DEFAULT '1',
    `nombreConcesionaria` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `facebookUrl` VARCHAR(191) NULL,
    `instagramUrl` VARCHAR(191) NULL,
    `horariosAtencion` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `cotizacionDolar` DECIMAL(10, 2) NULL,
    `logoUrl` TEXT NULL,
    `faviconUrl` TEXT NULL,
    `siteTitle` VARCHAR(191) NULL,
    `siteDescription` TEXT NULL,
    `heroTitulo` VARCHAR(191) NULL,
    `heroSubtitulo` VARCHAR(191) NULL,
    `heroCtaTexto` VARCHAR(191) NULL,
    `heroCtaUrl` VARCHAR(191) NULL,
    `heroImagenUrl` TEXT NULL,
    `nosotrosTitulo` TEXT NULL,
    `nosotrosTexto` TEXT NULL,
    `nosotrosMetrica1Valor` VARCHAR(191) NULL,
    `nosotrosMetrica1Sufijo` VARCHAR(191) NULL,
    `nosotrosMetrica1Label` VARCHAR(191) NULL,
    `nosotrosMetrica2Valor` VARCHAR(191) NULL,
    `nosotrosMetrica2Sufijo` VARCHAR(191) NULL,
    `nosotrosMetrica2Label` VARCHAR(191) NULL,
    `finanEyebrow` VARCHAR(191) NULL,
    `finanTitulo` TEXT NULL,
    `finanTexto` TEXT NULL,
    `finanTasaAnual` DECIMAL(5, 2) NULL,
    `finanEntregaMinima` DECIMAL(5, 2) NULL,
    `finanCtaTexto` VARCHAR(191) NULL,
    `contactoEyebrow` VARCHAR(191) NULL,
    `contactoTitulo` TEXT NULL,
    `contactoTexto` TEXT NULL,
    `contactoWhatsappTexto` VARCHAR(191) NULL,
    `footerTexto` VARCHAR(191) NULL,
    `terminosUrl` VARCHAR(191) NULL,
    `privacidadUrl` VARCHAR(191) NULL,
    `colorPrimario` VARCHAR(7) NULL,
    `colorAcento` VARCHAR(7) NULL,
    `colorFondo` VARCHAR(7) NULL,
    `colorSuperficie` VARCHAR(7) NULL,
    `colorTexto` VARCHAR(7) NULL,
    `colorTextoSuave` VARCHAR(7) NULL,
    `colorTextoSobrePrimario` VARCHAR(7) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `planes_financiacion` (
    `id` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `cuotas` INTEGER NOT NULL,
    `tasaAnual` DECIMAL(5, 2) NOT NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `solicitudes_financiacion` (
    `id` VARCHAR(191) NOT NULL,
    `vehiculoId` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `apellido` VARCHAR(191) NOT NULL,
    `dni` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `ingresos` DECIMAL(12, 2) NULL,
    `anticipo` DECIMAL(12, 2) NOT NULL,
    `cuotas` INTEGER NOT NULL,
    `estado` ENUM('PENDIENTE', 'VISTA', 'RESPONDIDA', 'CERRADA') NOT NULL DEFAULT 'PENDIENTE',
    `mensaje` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `solicitudes_financiacion_vehiculoId_idx`(`vehiculoId`),
    INDEX `solicitudes_financiacion_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
