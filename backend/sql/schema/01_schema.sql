-- schema.sql — Esquema adaptado a las decisiones de Tarea 1
-- Basado en tarea2.sql pero extendido para reflejar los tipos de miembro
-- y la estructura de actividades definida en el frontend.

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `tarea2`;
CREATE SCHEMA IF NOT EXISTS `tarea2` DEFAULT CHARACTER SET utf8;
USE `tarea2`;

-- ── Región ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `region` (
  `id`     INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB;

-- ── Comuna ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `comuna` (
  `id`        INT NOT NULL AUTO_INCREMENT,
  `nombre`    VARCHAR(200) NOT NULL,
  `region_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_comuna_region_idx` (`region_id` ASC),
  CONSTRAINT `fk_comuna_region`
    FOREIGN KEY (`region_id`) REFERENCES `region` (`id`)
) ENGINE = InnoDB;

-- ── Miembro ───────────────────────────────────────────────────
-- Extiende el modelo original para reflejar los tipos de miembro
-- definidos en Tarea 1 (pregrado, postgrado, funcionario, académico).
CREATE TABLE IF NOT EXISTS `miembro` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `nombre`         VARCHAR(255) NOT NULL,
  `rut`            VARCHAR(12) NOT NULL UNIQUE,
  `tipo`           ENUM('pregrado','postgrado','funcionario','academico') NOT NULL,
  `email`          VARCHAR(80) NOT NULL,
  `telefono`       VARCHAR(20) NOT NULL DEFAULT '',
  `fecha_registro` DATETIME NOT NULL,
  `comuna_id`      INT NOT NULL,
  -- Campos pregrado
  `plan_estudio`   VARCHAR(50) NULL,
  `anio_ingreso`   SMALLINT NULL,
  -- Campos postgrado
  `programa`       VARCHAR(100) NULL,
  `profesor_guia`  VARCHAR(150) NULL,
  -- Campos funcionario
  `cargo`          VARCHAR(100) NULL,
  `unidad`         VARCHAR(100) NULL,
  `tipo_contrato`  ENUM('planta','contrata','honorarios') NULL,
  -- Campos académico
  `jerarquia`      ENUM('asistente','asociado','titular','adjunto') NULL,
  `area_investigacion` VARCHAR(200) NULL,
  `oficina`        VARCHAR(20) NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_miembro_comuna_idx` (`comuna_id` ASC),
  CONSTRAINT `fk_miembro_comuna`
    FOREIGN KEY (`comuna_id`) REFERENCES `comuna` (`id`)
) ENGINE = InnoDB;

-- ── Actividad ─────────────────────────────────────────────────
-- Cada miembro puede tener múltiples actividades (máx. 10).
-- Una actividad puede tener múltiples horarios.
CREATE TABLE IF NOT EXISTS `actividad` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `miembro_id`     INT NOT NULL,
  `titulo`         VARCHAR(150) NOT NULL,
  `categoria`      ENUM('artistica','deportiva','tecnologica','social','recreativa','otra') NOT NULL,
  `descripcion`    TEXT NULL,
  `lugar`          VARCHAR(200) NULL,
  `enlace`         VARCHAR(500) NULL,
  `fecha_registro` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_actividad_miembro_idx` (`miembro_id` ASC),
  CONSTRAINT `fk_actividad_miembro`
    FOREIGN KEY (`miembro_id`) REFERENCES `miembro` (`id`)
) ENGINE = InnoDB;

-- ── Horario ───────────────────────────────────────────────────
-- Una actividad puede tener múltiples bloques horarios.
-- Se usa hora_inicio y hora_fin (en vez de duración) para
-- mantener consistencia con la validación de traslapes del frontend.
CREATE TABLE IF NOT EXISTS `horario` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `actividad_id` INT NOT NULL,
  `dia`         ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_inicio` VARCHAR(5) NOT NULL,
  `hora_fin`    VARCHAR(5) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_horario_actividad_idx` (`actividad_id` ASC),
  CONSTRAINT `fk_horario_actividad`
    FOREIGN KEY (`actividad_id`) REFERENCES `actividad` (`id`)
) ENGINE = InnoDB;

-- ── Foto ──────────────────────────────────────────────────────
-- Archivos multimedia asociados a una actividad.
CREATE TABLE IF NOT EXISTS `foto` (
  `id`             INT NOT NULL AUTO_INCREMENT,
  `actividad_id`   INT NOT NULL,
  `nombre_archivo` VARCHAR(300) NOT NULL,
  `ruta_archivo`   VARCHAR(300) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_foto_actividad_idx` (`actividad_id` ASC),
  CONSTRAINT `fk_foto_actividad`
    FOREIGN KEY (`actividad_id`) REFERENCES `actividad` (`id`)
) ENGINE = InnoDB;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
