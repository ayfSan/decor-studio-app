CREATE DATABASE  IF NOT EXISTS `2d_decorstudio_v2` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `2d_decorstudio_v2`;
-- MySQL dump 10.13  Distrib 8.0.31, for Win64 (x86_64)
--
-- Host: localhost    Database: 2d_decorstudio_v2
-- ------------------------------------------------------
-- Server version	8.0.31

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account_cashflow`
--

DROP TABLE IF EXISTS `account_cashflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account_cashflow` (
  `idaccount_cashflow` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`idaccount_cashflow`),
  UNIQUE KEY `account_cashflow_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account_cashflow`
--

LOCK TABLES `account_cashflow` WRITE;
/*!40000 ALTER TABLE `account_cashflow` DISABLE KEYS */;
INSERT INTO `account_cashflow` VALUES (2,'Касса (наличные)'),(1,'Основной счет (банк)');
/*!40000 ALTER TABLE `account_cashflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cashflow`
--

DROP TABLE IF EXISTS `cashflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cashflow` (
  `idcashflow` int NOT NULL AUTO_INCREMENT,
  `date` datetime(3) NOT NULL,
  `transaction` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_cashflow_idaccount_cashflow` int NOT NULL,
  `category_cashflow_idcategory_cashflow` int NOT NULL,
  `event_idevent` int NOT NULL,
  `note` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `income` decimal(10,2) NOT NULL,
  `expense` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idcashflow`),
  KEY `cashflow_account_cashflow_idaccount_cashflow_fkey` (`account_cashflow_idaccount_cashflow`),
  KEY `cashflow_category_cashflow_idcategory_cashflow_fkey` (`category_cashflow_idcategory_cashflow`),
  KEY `cashflow_event_idevent_fkey` (`event_idevent`),
  CONSTRAINT `cashflow_account_cashflow_idaccount_cashflow_fkey` FOREIGN KEY (`account_cashflow_idaccount_cashflow`) REFERENCES `account_cashflow` (`idaccount_cashflow`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cashflow_category_cashflow_idcategory_cashflow_fkey` FOREIGN KEY (`category_cashflow_idcategory_cashflow`) REFERENCES `category_cashflow` (`idcategory_cashflow`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `cashflow_event_idevent_fkey` FOREIGN KEY (`event_idevent`) REFERENCES `event` (`idevent`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashflow`
--

LOCK TABLES `cashflow` WRITE;
/*!40000 ALTER TABLE `cashflow` DISABLE KEYS */;
INSERT INTO `cashflow` VALUES (1,'2026-08-01 10:00:00.000','Предоплата за корпоратив',1,1,2,'50% предоплата',175000.00,0.00);
/*!40000 ALTER TABLE `cashflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_cashflow`
--

DROP TABLE IF EXISTS `category_cashflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_cashflow` (
  `idcategory_cashflow` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`idcategory_cashflow`),
  UNIQUE KEY `category_cashflow_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_cashflow`
--

LOCK TABLES `category_cashflow` WRITE;
/*!40000 ALTER TABLE `category_cashflow` DISABLE KEYS */;
INSERT INTO `category_cashflow` VALUES (2,'Аренда оборудования'),(3,'Закупка материалов'),(1,'Оплата от клиента');
/*!40000 ALTER TABLE `category_cashflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_event`
--

DROP TABLE IF EXISTS `category_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_event` (
  `idcategory_event` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`idcategory_event`),
  UNIQUE KEY `category_event_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_event`
--

LOCK TABLES `category_event` WRITE;
/*!40000 ALTER TABLE `category_event` DISABLE KEYS */;
INSERT INTO `category_event` VALUES (3,'День рождения'),(2,'Корпоратив'),(1,'Свадьба');
/*!40000 ALTER TABLE `category_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact`
--

DROP TABLE IF EXISTS `contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact` (
  `idcontact` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `specialty` varchar(191) DEFAULT NULL,
  `phone` varchar(45) DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`idcontact`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact`
--

LOCK TABLES `contact` WRITE;
/*!40000 ALTER TABLE `contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `idcustomer` int NOT NULL AUTO_INCREMENT,
  `name_customer` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idcustomer`),
  UNIQUE KEY `customer_phone_key` (`phone`),
  UNIQUE KEY `customer_telegram_username_key` (`telegram_username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Иванов Иван Петрович','Иванов Иван Петрович','+79112223344','ivan_ivanov','Частный клиент'),(2,'ООО \"Ромашка\"','Сидорова Анна','+79223334455','oooromashka','Корпоративный клиент, нужны акты');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document`
--

DROP TABLE IF EXISTS `document`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document` (
  `iddocument` int NOT NULL AUTO_INCREMENT,
  `event_idevent` int NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_number` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `date` datetime(3) NOT NULL,
  `type` enum('ACT','CONTRACT','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`iddocument`),
  KEY `document_event_idevent_fkey` (`event_idevent`),
  CONSTRAINT `document_event_idevent_fkey` FOREIGN KEY (`event_idevent`) REFERENCES `event` (`idevent`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event`
--

DROP TABLE IF EXISTS `event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event` (
  `idevent` int NOT NULL AUTO_INCREMENT,
  `date` datetime(3) NOT NULL,
  `project_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category_event_idcategory_event` int NOT NULL,
  `venue_idvenue` int NOT NULL,
  `customer_idcustomer` int NOT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `participants` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idevent`),
  UNIQUE KEY `event_project_name_key` (`project_name`),
  KEY `event_category_event_idcategory_event_fkey` (`category_event_idcategory_event`),
  KEY `event_venue_idvenue_fkey` (`venue_idvenue`),
  KEY `event_customer_idcustomer_fkey` (`customer_idcustomer`),
  CONSTRAINT `event_category_event_idcategory_event_fkey` FOREIGN KEY (`category_event_idcategory_event`) REFERENCES `category_event` (`idcategory_event`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `event_customer_idcustomer_fkey` FOREIGN KEY (`customer_idcustomer`) REFERENCES `customer` (`idcustomer`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `event_venue_idvenue_fkey` FOREIGN KEY (`venue_idvenue`) REFERENCES `venue` (`idvenue`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,'2025-06-15 14:00:00.000','Тестовая Свадьба Ивановых',1,1,1,200000.00,'Молодожены и 50 гостей'),(2,'2025-08-20 18:00:00.000','Тестовый Корпоратив ООО \"Ромашка\"',2,2,2,350000.00,'Сотрудники компании, 70 человек'),(3,'2025-06-04 23:03:00.000','Тестовое мероприятие 1243',2,2,1,500000.00,'-'),(4,'2025-06-05 09:22:00.000','еще один тест1№',1,2,1,10.00,'');
/*!40000 ALTER TABLE `event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_contact`
--

DROP TABLE IF EXISTS `event_contact`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_contact` (
  `event_idevent` int NOT NULL,
  `contact_idcontact` int NOT NULL,
  PRIMARY KEY (`event_idevent`,`contact_idcontact`),
  KEY `fk_event_contact_contact` (`contact_idcontact`),
  CONSTRAINT `fk_event_contact_contact` FOREIGN KEY (`contact_idcontact`) REFERENCES `contact` (`idcontact`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_contact_event` FOREIGN KEY (`event_idevent`) REFERENCES `event` (`idevent`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_contact`
--

LOCK TABLES `event_contact` WRITE;
/*!40000 ALTER TABLE `event_contact` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_contact` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_user`
--

DROP TABLE IF EXISTS `event_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_user` (
  `event_idevent` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`event_idevent`,`user_id`),
  KEY `fk_event_user_user` (`user_id`),
  CONSTRAINT `fk_event_user_event` FOREIGN KEY (`event_idevent`) REFERENCES `event` (`idevent`) ON DELETE CASCADE,
  CONSTRAINT `fk_event_user_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_user`
--

LOCK TABLES `event_user` WRITE;
/*!40000 ALTER TABLE `event_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `telegram_id` int NOT NULL,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_telegram_id_key` (`telegram_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `venue`
--

DROP TABLE IF EXISTS `venue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `venue` (
  `idvenue` int NOT NULL AUTO_INCREMENT,
  `name_venue` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_person` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idvenue`),
  UNIQUE KEY `venue_contact_person_key` (`contact_person`),
  UNIQUE KEY `venue_phone_key` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `venue`
--

LOCK TABLES `venue` WRITE;
/*!40000 ALTER TABLE `venue` DISABLE KEYS */;
INSERT INTO `venue` VALUES (1,'Ресторан \"Панорама\"','г. Город, ул. Центральная, 1','Администратор Мария','+79001234567','Вместимость до 100 человек'),(2,'Лофт \"Облака\"','г. Город, пр. Небесный, 10','Менеджер Алексей','+79007654321','Современное пространство, до 70 человек');
/*!40000 ALTER TABLE `venue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database '2d_decorstudio_v2'
--

--
-- Dumping routines for database '2d_decorstudio_v2'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-06  0:48:37
