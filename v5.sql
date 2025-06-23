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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cashflow`
--

LOCK TABLES `cashflow` WRITE;
/*!40000 ALTER TABLE `cashflow` DISABLE KEYS */;
INSERT INTO `cashflow` VALUES (1,'2026-08-01 10:00:00.000','Предоплата за корпоратив',1,1,2,'50% предоплата',175000.00,0.00),(2,'2025-06-09 14:45:00.000','',1,2,5,'',555555.00,0.00);
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
-- Table structure for table `company_details`
--

DROP TABLE IF EXISTS `company_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `legal_basis` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `inn` varchar(20) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `bank_name` varchar(191) NOT NULL,
  `checking_account` varchar(30) NOT NULL,
  `correspondent_account` varchar(30) NOT NULL,
  `bic` varchar(20) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_details`
--

LOCK TABLES `company_details` WRITE;
/*!40000 ALTER TABLE `company_details` DISABLE KEYS */;
INSERT INTO `company_details` VALUES (1,'ИП Пятунина Анна Сергеевна','свидетельства о государственной регистрации №123456789','г. Пермь, ул. Главная, д. 1, кв. 10','123456789012','+7 (999) 123-45-67','АО «СуперБанк»','40802810100000000001','30101810500000000002','044525003',1);
/*!40000 ALTER TABLE `company_details` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact`
--

LOCK TABLES `contact` WRITE;
/*!40000 ALTER TABLE `contact` DISABLE KEYS */;
INSERT INTO `contact` VALUES (2,'Тест 1','-','-','-');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `document_template_id` int DEFAULT NULL,
  PRIMARY KEY (`iddocument`),
  KEY `document_event_idevent_fkey` (`event_idevent`),
  KEY `fk_document_template_idx` (`document_template_id`),
  CONSTRAINT `document_event_idevent_fkey` FOREIGN KEY (`event_idevent`) REFERENCES `event` (`idevent`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_document_template` FOREIGN KEY (`document_template_id`) REFERENCES `document_template` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
INSERT INTO `document` VALUES (4,2,'Акт выполненных работ','АКТ-4','2025-06-09 22:27:25.408','ACT',NULL,2),(5,2,'Договор на декор','ДК-5','2025-06-16 04:29:02.127','CONTRACT',NULL,1),(6,6,'Договор на декор','ДК-6','2025-06-16 23:17:17.780','CONTRACT',NULL,1);
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_template`
--

DROP TABLE IF EXISTS `document_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_template` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `type` enum('CONTRACT','ACT','OTHER') NOT NULL DEFAULT 'OTHER',
  `prefix` varchar(20) DEFAULT NULL,
  `content` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_template`
--

LOCK TABLES `document_template` WRITE;
/*!40000 ALTER TABLE `document_template` DISABLE KEYS */;
INSERT INTO `document_template` VALUES (1,'Договор на декор','CONTRACT','ДК','<p>\\n\\n\\n    </p><p><br></p><p>\\n    </p><p><br></p><p>\\n    </p><p><br></p><p>\\n\\n\\n    </p><h1>ДОГОВОР № {{documentNumber}}</h1><p>\\n    </p><h2>на оказание услуг по декоративно-художественному оформлению</h2><p>\\n\\n    \\n        \\n            \\n            \\n        \\n    </p><p><br></p><p>\\n\\n    </p><p>\\n        <strong>{{executorName}}</strong>, именуемый(ая) в дальнейшем «<strong>Исполнитель</strong>», действующий(ая) на основании {{executorLegalBasis}}, с одной стороны, и\\n        гражданин(ка) <strong>{{customerName}}</strong>, именуемый(ая) в дальнейшем «<strong>Заказчик</strong>», с другой стороны, совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:\\n    </p><p>\\n\\n    </p><h3>1. ПРЕДМЕТ ДОГОВОРА</h3><p>\\n    </p><p>1.1. Исполнитель обязуется по заданию Заказчика оказать услуги по декоративно-художественному оформлению мероприятия «{{eventName}}» (далее – «Услуги»), которое состоится {{eventDate}} по адресу: {{eventVenue}}, а Заказчик обязуется принять и оплатить эти Услуги.</p><p>\\n    </p><p>1.2. Объем, перечень и требования к Услугам согласовываются Сторонами в Приложении №1 (Техническое задание), которое является неотъемлемой частью настоящего Договора. (<em>Примечание: для простоты можно включить описание прямо в этот пункт или удалить ссылку на приложение</em>).</p><p>\\n\\n    </p><h3>2. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЕТОВ</h3><p>\\n    </p><p>2.1. Общая стоимость Услуг по настоящему Договору составляет <strong>{{eventCost}} (сумма прописью) рублей 00 копеек</strong>.</p><p>\\n    </p><p>2.2. Оплата Услуг производится в следующем порядке:</p><p>\\n    </p><p>2.2.1. Заказчик вносит предоплату в размере <strong>{{prepaymentAmount}} рублей</strong> в течение 3 (трех) банковских дней с момента подписания настоящего Договора.</p><p>\\n    </p><p>2.2.2. Окончательный расчет в размере <strong>{{prepaymentAmount}} рублей</strong> производится не позднее дня проведения мероприятия.</p><p>\\n    </p><p>2.3. Способ оплаты: (<em>выберите нужное: наличный расчет, перевод на банковскую карту, безналичный расчет по реквизитам</em>).</p><p>\\n\\n    </p><h3>3. ПРАВА И ОБЯЗАННОСТИ СТОРОН</h3><p>\\n    </p><p>3.1. <strong>Исполнитель обязуется:</strong></p><p>\\n    </p><p>3.1.1. Оказать Услуги качественно и в срок, указанный в п. 1.1. настоящего Договора.</p><p>\\n    </p><p>3.1.2. Использовать для оказания Услуг собственные материалы и оборудование.</p><p>\\n    </p><p>3.1.3. Обеспечить сохранность имущества Заказчика и площадки проведения мероприятия в процессе монтажа и демонтажа декораций.</p><p>\\n    </p><p>3.2. <strong>Заказчик обязуется:</strong></p><p>\\n    </p><p>3.2.1. Своевременно произвести оплату Услуг в соответствии с разделом 2 настоящего Договора.</p><p>\\n    </p><p>3.2.2. Обеспечить Исполнителю беспрепятственный доступ к месту проведения мероприятия для выполнения монтажных и демонтажных работ.</p><p>\\n    </p><p>3.2.3. Принять оказанные Услуги по акту приема-передачи (в случае необходимости).</p><p>\\n    \\n    </p><h3>4. ОТВЕТСТВЕННОСТЬ СТОРОН</h3><p>\\n    </p><p>4.1. За неисполнение или ненадлежащее исполнение обязательств по настоящему Договору Стороны несут ответственность в соответствии с действующим законодательством РФ.</p><p>\\n    </p><p>4.2. В случае порчи или утраты декораций и оборудования Исполнителя по вине Заказчика или гостей мероприятия, Заказчик обязуется возместить Исполнителю полную стоимость причиненного ущерба.</p><p>\\n    \\n    </p><h3>5. ФОРС-МАЖОР</h3><p>\\n    </p><p>5.1. Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему Договору, если это неисполнение явилось следствием обстоятельств непреодолимой силы (форс-мажор), возникших после заключения Договора в результате событий чрезвычайного характера, которые Стороны не могли ни предвидеть, ни предотвратить разумными мерами.</p><p>\\n\\n    </p><h3>6. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h3><p>\\n    </p><p>6.1. Настоящий Договор вступает в силу с момента его подписания обеими Сторонами и действует до полного исполнения ими своих обязательств.</p><p>\\n    </p><p>6.2. Все изменения и дополнения к настоящему Договору действительны лишь в том случае, если они совершены в письменной форме и подписаны уполномоченными представителями Сторон.</p><p>\\n    </p><p>6.3. Настоящий Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, по одному для каждой из Сторон.</p><p>\\n\\n    </p><h3>7. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h3><p>\\n    \\n        \\n            \\n            \\n        \\n    </p><p><br></p><p>\\n\\n</p>','2025-06-09 11:01:48','2025-06-09 16:58:15'),(2,'Акт выполненных работ','ACT','АКТ','<p><br></p><h1>АКТ № {{documentNumber}}</h1><p><br></p><p style=\"text-align: center;\">приемки-сдачи оказанных услуг по Договору № {{documentNumber}} от {{documentDate}}</p><p><br></p><p><br></p><p>  </p><p>        <strong>{{executorName}}</strong>, именуемый(ая) в дальнейшем «<strong>Исполнитель</strong>», и       <strong>{{customerName}}</strong>, именуемый(ая) в дальнейшем «<strong>Заказчик</strong>», составили настоящий Акт о нижеследующем:    </p><p>    </p><p>1. В соответствии с Договором № {{documentNumber}} от {{documentDate}} Исполнитель выполнил, а Заказчик принял следующие услуги по декоративно-художественному оформлению мероприятия «{{eventName}}»:</p><p>   </p><p><br></p><p>   </p><p>2. Общая стоимость оказанных услуг составляет <strong>{{eventCost}} (сумма прописью) рублей 00 копеек</strong>.</p><p><br></p><p>3. Услуги оказаны в полном объеме, в установленные сроки и с надлежащим качеством. Стороны друг к другу претензий не имеют.</p><p>    </p><p>Настоящий Акт составлен в двух экземплярах, по одному для каждой из Сторон.</p><p>   </p><h2 style=\"font-size: 14px; text-align: left; margin-top: 40px;\">ПОДПИСИ СТОРОН:</h2><p>   </p><p><br></p><p><br></p>','2025-06-09 11:01:48','2025-06-09 17:04:57');
/*!40000 ALTER TABLE `document_template` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event`
--

LOCK TABLES `event` WRITE;
/*!40000 ALTER TABLE `event` DISABLE KEYS */;
INSERT INTO `event` VALUES (1,'2025-06-15 09:00:00.000','Тестовая Свадьба Ивановых',1,1,1,200000.00,'Молодожены и 50 гостей'),(2,'2025-08-19 22:00:00.000','Тестовый Корпоратив ООО \"Ромашка\"',2,2,2,350000.00,'Сотрудники компании, 70 человек'),(3,'2025-06-04 18:03:00.000','Тестовое мероприятие 1243',2,2,1,500000.00,'-'),(5,'2025-06-18 04:15:00.000','Тест1',2,1,1,250000.00,NULL),(6,'2025-06-16 23:16:00.000','tot hfp1',3,2,1,50000.00,NULL);
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
INSERT INTO `event_contact` VALUES (2,2),(6,2);
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
INSERT INTO `event_user` VALUES (6,3);
/*!40000 ALTER TABLE `event_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin'),(2,'manager'),(3,'user');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `idtask` int NOT NULL AUTO_INCREMENT,
  `event_idevent` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `completed` tinyint(1) NOT NULL DEFAULT '0',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idtask`),
  KEY `fk_task_event_idx` (`event_idevent`),
  CONSTRAINT `fk_task_event` FOREIGN KEY (`event_idevent`) REFERENCES `event` (`idevent`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (1,2,'Проверить свечи ','Проверить свечи на чистоту, при необходимости заменить батарейки',0,'low','2025-06-10','2025-06-09 16:24:48'),(4,2,'Съездить в строительный магазин','Закупить строительные материалы: стяжки, мусорные пакеты',1,'high','2025-06-17','2025-06-15 23:10:10'),(5,2,'Заготовки из пластика ','Закупить пластик, нарезать на части, прибить степлером ',0,'medium','2025-06-03','2025-06-15 23:21:12');
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_chat_id` bigint DEFAULT NULL,
  `telegram_link_code` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_link_code_expires_at` datetime DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`),
  UNIQUE KEY `telegram_chat_id_UNIQUE` (`telegram_chat_id`),
  UNIQUE KEY `telegram_link_code_UNIQUE` (`telegram_link_code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (3,'admin','$2b$10$4ckgHROCf.TvwxX7iqLAJO3CeOpFsLJG2OcWUk633eWZ91U6U3BMq','Admin','User',NULL,NULL,NULL,'2025-05-05 00:00:00.000'),(4,'newadmin','$2b$10$fPL.92g2D1W9v9zC1i./..I4f0G39w6t.H0Y.Cea4nB42T4gG.8OW','Новый','Админ',NULL,NULL,NULL,'2025-06-10 01:23:59.000');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_user_roles_role_idx` (`role_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (3,1),(4,1);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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

-- Dump completed on 2025-06-23 22:10:09
