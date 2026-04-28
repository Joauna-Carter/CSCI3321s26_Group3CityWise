CREATE DATABASE  IF NOT EXISTS `citywise` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `citywise`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: citywise
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `CityID` int NOT NULL AUTO_INCREMENT,
  `CityName` varchar(100) NOT NULL,
  `CountryID` int NOT NULL,
  `Population` bigint DEFAULT NULL,
  `Description` text,
  `Latitude` decimal(9,6) DEFAULT NULL,
  `Longitude` decimal(9,6) DEFAULT NULL,
  `CityImagePath` text,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`CityID`),
  UNIQUE KEY `uq_city_country` (`CityName`,`CountryID`),
  KEY `fk_cities_country` (`CountryID`),
  CONSTRAINT `fk_cities_country` FOREIGN KEY (`CountryID`) REFERENCES `countries` (`CountryID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Los Angeles',1,3898747,'Major U.S. city known for Hollywood, entertainment, beaches, and culture',34.050000,-118.250000,'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Los_Angeles_with_Mount_Baldy.jpg/960px-Los_Angeles_with_Mount_Baldy.jpg',1),(2,'Mexico City',3,9209944,'Capital and largest city of Mexico, known for rich history, Aztec origins, and cultural landmarks',19.430000,-99.130000,'https://content.presspage.com/uploads/2278/3fa93fbb-a0df-4b70-9d4b-6591f5afd01f/1920_adobestock-192337612.jpeg?10000',1),(3,'Paris',10,2050000,'France\'s capital, is a major European city and a global center for art, fashion, gastronomy and culture.',48.857500,2.352200,'https://www.royalcaribbean.com/media-assets/pmc/content/dam/shore-x/paris-le-havre-leh/lh17-paris-sightseeing-without-lunch/stock-photo-skyline-of-paris-with-eiffel-tower-at-sunset-in-paris-france-eiffel-tower-is-one-of-the-most-752725282.jpg?w=1024',1),(4,'Rome',12,2800000,'the capital city and most populated comune of Italy. It is also the administrative centre of the Lazio region and of the Metropolitan City of Rome.',41.902800,12.496400,'https://thumbs.dreamstime.com/b/rome-skyline-st-peter-cathedral-italy-wonderful-view-sunset-102885136.jpg',1),(5,'Seoul',41,9600000,'the capital of South Korea, is a huge metropolis where modern skyscrapers, high-tech subways and pop culture meet Buddhist temples, palaces and street markets.',37.560000,126.990000,'https://t4.ftcdn.net/jpg/02/58/00/87/360_F_258008704_rtbLWxLBUfMsryzYHEh7pfRkwEspn9XV.jpg',1),(6,'Rio de Janeiro',7,6750000,'a huge seaside city in Brazil, famed for its Copacabana and Ipanema beaches, 38m Christ the Redeemer statue atop Mount Corcovado and for Sugarloaf Mountain, a granite peak with cable cars to its summit.',-22.906800,-43.172900,'https://media.istockphoto.com/id/531479034/photo/sugarloaf-mountain-in-rio-de-janeiro-brazil.jpg?s=612x612&w=0&k=20&c=1kNny8LTj7iw21MyAT_fF0x6FXHpHLrn0qQ0PUueCEo=',1),(7,'Buenos Aires',8,3100000,'Argentina’s big, cosmopolitan capital city. Its center is the Plaza de Mayo, lined with stately 19th-century buildings including Casa Rosada, the iconic, balconied presidential palace.',-34.607568,-58.437089,'https://images.skyscrapercenter.com/uploads/Buenos-Aires_-2018_(CC__BY)Deensel_WEB201216-031248.jpg',1),(8,'Cairo',43,22000000,'Egypt’s sprawling capital, is set on the Nile River. At its heart is Tahrir Square and the vast Egyptian Museum, a trove of antiquities including royal mummies and gilded King Tutankhamun artifacts.',30.044400,31.235700,'https://t4.ftcdn.net/jpg/02/95/63/15/360_F_295631594_WTKGFGnCwpELtfDVnyPg0ol90z9XxBwK.jpg',1),(9,'Cape Town',20,5800000,'a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain.',-33.924900,18.424100,'https://www.shutterstock.com/image-photo/cape-town-city-cbd-table-600nw-2337902495.jpg',1),(10,'Melbourne',19,6000000,'a major, culturally diverse capital city in Victoria with rapid population growth, driven by a high overseas migration rate',-37.809600,144.965000,'https://media.timeout.com/images/105932250/1920/1440/image.webp',1);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cityfacts`
--

DROP TABLE IF EXISTS `cityfacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cityfacts` (
  `FactID` int NOT NULL AUTO_INCREMENT,
  `CityID` int NOT NULL,
  `FactType` varchar(50) NOT NULL,
  `FactSubtype` varchar(50) NOT NULL,
  `FactLabel` varchar(100) NOT NULL,
  `FactValue` text NOT NULL,
  `AltAnswers` text,
  `FactImagePath` text,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`FactID`),
  KEY `fk_cityfacts_city` (`CityID`),
  CONSTRAINT `fk_cityfacts_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`)
) ENGINE=InnoDB AUTO_INCREMENT=169 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cityfacts`
--

LOCK TABLES `cityfacts` WRITE;
/*!40000 ALTER TABLE `cityfacts` DISABLE KEYS */;
INSERT INTO `cityfacts` VALUES (1,1,'QuickFact','General','Country','United States','USA;US',NULL,1),(2,1,'QuickFact','General','Population','3,898,747','3.9 million',NULL,1),(3,1,'QuickFact','General','Demonym','Angeleno','Angelino',NULL,1),(4,1,'QuickFact','Geography','Elevation','233 ft','71 m',NULL,1),(5,1,'QuickFact','Culture','Named After','Our Lady, Queen of the Angels',NULL,NULL,1),(6,1,'QuickFact','Symbol','Official Tree','Coral Tree (Erythrina afra)','Coral tree','https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Erythrina_Caffra_flower.JPG/1280px-Erythrina_Caffra_flower.JPG',1),(7,1,'QuickFact','Symbol','Official Flower','Bird of Paradise (Strelitzia reginae)','Bird of Paradise','https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Raggiana_Bird-of-Paradise_wild_5.jpg/500px-Raggiana_Bird-of-Paradise_wild_5.jpg',1),(8,1,'QuickFact','Symbol','Official Plant','Toyon (Heteromeles arbutifolia)','Toyon plant','https://calscape.org/storage/app/species_images/calphotos/images/0000_0000_0113_2069.jpeg',1),(9,1,'FunFact','Landmark','Contains over 2,600 stars','Hollywood Walk of Fame','2600 stars','https://www.californiabeaches.com/wp-content/uploads/2016/06/hollywood-walk-of-fame-60601.jpg',1),(10,1,'FunFact','Landmark','Largest Ice Age fossil site in the world','La Brea Tar Pits',NULL,'https://allosaurusroar.com/wp-content/uploads/2016/06/la-brea-museum-elephants.jpg',1),(11,1,'FunFact','Event','Only North American city to host the Olympics twice','Los Angeles','Olympics',NULL,1),(12,1,'FunFact','Landmark','Theme park and real working film studio','Universal Studios Hollywood','Universal Studios','https://www.thegarland.com/images/hero/small/ush-globe-header.jpg',1),(13,1,'FunFact','Culture','Largest historic theatre district on the National Register of Historic Places','Los Angeles','Historic Theatre District','https://loveseatown.com/app/uploads/2025/01/historic-theatre-district-202501-paramount-theatre-4x3-v1.jpg',1),(14,2,'QuickFact','General','Country','Mexico',NULL,NULL,1),(15,2,'QuickFact','General','Population','9,209,944','9.2 million',NULL,1),(16,2,'QuickFact','General','Demonym','Capitalino','Chilango',NULL,1),(17,2,'QuickFact','Geography','Elevation','2,240 m','7,350 ft',NULL,1),(18,2,'QuickFact','Culture','Nickname','La Ciudad de los Palacios','City of Palaces',NULL,1),(19,2,'QuickFact','Culture','Motto','Capital de la transformación','Capital of the transformation',NULL,1),(20,2,'QuickFact','History','Founded','1325','Tenochtitlan',NULL,1),(21,2,'QuickFact','Status','Capital of Mexico','Mexico City','Capital city',NULL,1),(22,2,'FunFact','Geography','Most populous city in North America','Mexico City',NULL,NULL,1),(23,2,'FunFact','Landmark','Largest urban park in Latin America','Chapultepec Park','Bosque de Chapultepec','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjpjdyI5ZDr3I0PtWdVPf_1UIZLajGn9DKHA&s',1),(24,2,'FunFact','Culture','Known for Aztec and colonial architecture','Historic Center of Mexico City',NULL,'https://lifeontheroam.com/wp-content/uploads/2023/07/Palace-of-Fine-Arts-Mexico-City-Historic-Centre-t-min.webp',1),(25,2,'FunFact','Culture','Second most museums in the world','Mexico City','2nd most museums',NULL,1),(26,2,'FunFact','Religion','Second most visited Catholic shrine','Basilica of Guadalupe',NULL,'https://mexiconewsdaily.com/wp-content/uploads/2025/12/NB.jpg',1),(27,2,'FunFact','Landmark','Only royal castle in the Americas','Chapultepec Castle',NULL,'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Castillo-de-chapultepec.jpg/250px-Castillo-de-chapultepec.jpg',1),(28,2,'FunFact','Landmark','Monument celebrating Mexico’s independence','Angel of Independence','El Ángel','https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Victoria_Alada_de_la_Columna_de_la_Independencia_01.jpg/250px-Victoria_Alada_de_la_Columna_de_la_Independencia_01.jpg',1),(29,3,'QuickFact','General','Country','France',NULL,NULL,1),(30,3,'QuickFact','General','Population','2,800,000','2.8 million',NULL,1),(31,3,'QuickFact','Culture','Nickname','City of Lights',NULL,NULL,1),(32,3,'FunFact','History','Originally a Roman city called','Lutetia',NULL,NULL,1),(33,3,'FunFact','Landmark','World\'s largest art museum','Louvre',NULL,'https://res.cloudinary.com/odysseytraveller/image/fetch/f_auto,q_auto,dpr_auto,r_4,w_1520,h_700,c_fill/https://cdn.odysseytraveller.com/app/uploads/2018/08/louvre-102840.jpg',1),(34,3,'FunFact','Landmark','Monument honoring French Revolution and Napoleonic Wars','Arc de Triomphe',NULL,'https://cdn.britannica.com/28/255528-050-E63F53A7/arc-de-triumph-paris-france.jpg',1),(35,3,'FunFact','Landmark','Underground ossuaries holding over six million people','Catacombs of Paris','Paris Catacombs','https://www.parisperfect.com/g/photos/upload/sml_1055743116-1451221585-correctsize-catacombs-hero.jpg',1),(36,3,'FunFact','Landmark','Main bell of Notre Dame Cathedral','Emmanuel',NULL,NULL,1),(37,3,'FunFact','Geography','Number of streets in Paris','6,100 rues','6,100',NULL,1),(38,3,'FunFact','Geography','Shortest street in Paris','Rue des Degrés',NULL,NULL,1),(39,3,'FunFact','Culture','First public movie screening location','Paris',NULL,NULL,1),(40,3,'FunFact','Culture','Inventors of early cinema','Auguste and Louis Lumière','Lumière brothers','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPXcKTRA8El2bAp0dHptWtGXHxvdbN8lCHQQ&s',1),(41,3,'FunFact','History','First printed book in France location','Paris',NULL,NULL,1),(42,3,'FunFact','Landmark','Number of Statue of Liberty replicas','3',NULL,'https://img.atlasobscura.com/IFVnJ2gafRqVikYd4jwkC0CA2muB3dsdN9jvvs2_ojQ/rt:fit/w:1200/q:80/sm:1/scp:1/ar:1/aHR0cHM6Ly9hdGxh/cy1kZXYuczMuYW1h/em9uYXdzLmNvbS91/cGxvYWRzL3BsYWNl/X2ltYWdlcy8xNWJi/NTYzNS1lZDhiLTRm/ODYtOGYxOS01ZGNk/MjliNGU1NjljYzky/YTg0NDYwMmRmYjM4/OTNfUGFyaXMtaWxl/LWF1eC1jeWduZXMt/c3RhdHVlLWRlLWxh/LWxpYmVydGUtdG91/ci1laWZmZWwtc2Vp/bmUuanBn.jpg',1),(43,3,'FunFact','Landmark','Steps to the top of the Eiffel Tower','1,665',NULL,'https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg',1),(44,3,'FunFact','History','First army to use camouflage','French army',NULL,NULL,1),(45,3,'FunFact','Landmark','Famous cathedral in Paris','Notre Dame Cathedral','Notre Dame','https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Notre-Dame_de_Paris_2013-07-24.jpg/250px-Notre-Dame_de_Paris_2013-07-24.jpg',1),(46,4,'QuickFact','General','Country','Italy',NULL,NULL,1),(47,4,'QuickFact','General','Population','2,746,984','2.7 million; 27000000',NULL,1),(48,4,'QuickFact','General','Demonym','Roman',NULL,NULL,1),(49,4,'QuickFact','Culture','Nickname','Eternal City',NULL,NULL,1),(50,4,'QuickFact','Culture','Nickname','City of Seven Hills',NULL,NULL,1),(51,4,'QuickFact','Culture','Nickname','Capital of the World','Caput Mundi',NULL,1),(52,4,'QuickFact','Geography','River flowing through Rome','Tiber River','Tiber',NULL,1),(53,4,'FunFact','History','Legendary founder of Rome','Romulus',NULL,'https://upload.wikimedia.org/wikipedia/commons/9/95/Brogi%2C_Carlo_%281850-1925%29_-_n._8226_-_Certosa_di_Pavia_-_Medaglione_sullo_zoccolo_della_facciata.jpg',1),(54,4,'FunFact','History','Traditional founding year of Rome','753 BC',NULL,NULL,1),(55,4,'FunFact','Geography','Number of fountains in Rome','280',NULL,NULL,1),(56,4,'FunFact','Culture','Number of churches in Rome','900',NULL,NULL,1),(57,4,'FunFact','Culture','Museum dedicated entirely to pasta','Pasta Museum',NULL,NULL,1),(58,4,'FunFact','Landmark','Coins tossed into Trevi Fountain each year','700,000 euros',NULL,NULL,1),(59,4,'FunFact','Landmark','Famous Roman fountain','Trevi Fountain',NULL,'https://static.wixstatic.com/media/e41b5c_5f12abc2ed614742ac47f306df5411ad~mv2.jpg/v1/fill/w_2500,h_1666,al_c/e41b5c_5f12abc2ed614742ac47f306df5411ad~mv2.jpg',1),(60,4,'FunFact','History','Roman road network length','53,000 miles','53,000',NULL,1),(61,4,'FunFact','History','Saying associated with Roman roads','All roads lead to Rome',NULL,NULL,1),(62,4,'FunFact','History','First shopping mall built by','Emperor Trajan',NULL,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXcHAdaC7hZMfaUhDfLGJ7O_o0BTLQpnNgQw&s',1),(63,4,'FunFact','History','First shopping mall built in Rome year','107–110 AD',NULL,NULL,1),(64,4,'FunFact','Landmark','Largest church ever constructed','St Peter’s Basilica',NULL,'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/1280px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg',1),(65,4,'FunFact','Landmark','Largest amphitheater in Rome','Colosseum',NULL,'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg',1),(66,4,'FunFact','Landmark','Ancient political and economic center of Rome','Roman Forum',NULL,'https://cdn.britannica.com/77/187677-138-73F32D16/buildings-Rome-Roman-Forum.jpg?w=800&h=450&c=crop',1),(67,4,'FunFact','Landmark','Ancient temple still standing','Pantheon',NULL,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsGmquVGlQW0CTk97rPLwvLZuFfy4uekotYQ&s',1),(68,4,'FunFact','Culture','City with the most monuments in the world','Rome',NULL,NULL,1),(69,5,'QuickFact','General','Country','South Korea',NULL,NULL,1),(70,5,'QuickFact','General','Population','9,600,000','9.6 million',NULL,1),(71,5,'QuickFact','General','Demonym','Seoulite',NULL,NULL,1),(72,5,'QuickFact','Status','Capital of South Korea','Seoul',NULL,NULL,1),(73,5,'QuickFact','Culture','Motto','Seoul, my soul',NULL,NULL,1),(74,5,'QuickFact','Geography','River flowing through Seoul','Han River',NULL,NULL,1),(75,5,'FunFact','History','Founded by','Taejo of Joseon',NULL,NULL,1),(76,5,'FunFact','History','Capital since','1394',NULL,NULL,1),(77,5,'FunFact','Culture','Number of royal palaces','5',NULL,NULL,1),(78,5,'FunFact','Landmark','Famous royal palace','Gyeongbokgung Palace',NULL,'https://travel.usnews.com/images/Gyeongbokgung_1_Getty_Images.jpg',1),(79,5,'FunFact','Geography','City divided by river','Han River',NULL,NULL,1),(80,5,'FunFact','Culture','Center of','Korean Wave','K-pop;Hallyu',NULL,1),(81,5,'FunFact','Culture','Major entertainment district','Gangnam',NULL,'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Teheran-ro_Yeongdong-daero_crossing_7.jpg/1280px-Teheran-ro_Yeongdong-daero_crossing_7.jpg',1),(82,5,'FunFact','Landmark','Famous observation tower','N Seoul Tower',NULL,'https://upload.wikimedia.org/wikipedia/en/a/a6/NamsanTower_%28Cropped%29.jpeg',1),(83,5,'FunFact','Geography','Distance from North Korea border','35 miles',NULL,NULL,1),(84,5,'FunFact','Culture','City known for 24-hour lifestyle','Seoul',NULL,NULL,1),(85,5,'FunFact','Landmark','Longest bridge fountain','Moonlight Rainbow Fountain',NULL,'https://static.wixstatic.com/media/0505b9_da9fbea9147b44e7b2ed725994c16d72~mv2.jpg/v1/fill/w_980,h_552,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/0505b9_da9fbea9147b44e7b2ed725994c16d72~mv2.jpg',1),(86,6,'QuickFact','General','Country','Brazil',NULL,NULL,1),(87,6,'QuickFact','General','Population','6,750,000','6.7 million',NULL,1),(88,6,'QuickFact','Culture','Demonym','Carioca',NULL,NULL,1),(89,6,'QuickFact','Status','State capital of Rio de Janeiro','Rio de Janeiro',NULL,NULL,1),(90,6,'QuickFact','Culture','Nickname','Cidade Maravilhosa','Marvelous City',NULL,1),(91,6,'QuickFact','Geography','Coordinates','22.90 S, 43.20 W',NULL,NULL,1),(92,6,'FunFact','Geography','Bay Rio was named after','Guanabara Bay',NULL,NULL,1),(93,6,'FunFact','History','Founded','1565',NULL,NULL,1),(94,6,'FunFact','Landmark','Famous statue in Rio','Christ the Redeemer',NULL,'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/960px-Christ_the_Redeemer_-_Cristo_Redentor.jpg',1),(95,6,'FunFact','Landmark','Famous mountain','Sugarloaf Mountain',NULL,'https://upload.wikimedia.org/wikipedia/commons/8/8d/P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg',1),(96,6,'FunFact','Landmark','Famous stadium','Maracanã Stadium',NULL,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJgBjDizg5uMeeDAN83Q8GZf-4CzfkAQ54Ew&s',1),(97,6,'FunFact','Culture','Famous festival','Carnival',NULL,'https://bookers.s3.amazonaws.com/pages/aquecendo-antes-do-desfile-concentracao.jpg',1),(98,6,'FunFact','Culture','Music styles from Rio','Samba;Bossa nova',NULL,NULL,1),(99,6,'FunFact','Landmark','Famous beaches','Copacabana','Ipanema','https://upload.wikimedia.org/wikipedia/commons/6/62/Praia_de_Copacabana_-_Rio_de_Janeiro%2C_Brasil.jpg',1),(100,6,'FunFact','Event','Hosted Olympics','2016',NULL,'https://cdn.britannica.com/64/190764-050-6D8D2A78/Logo-2016-Rio-de-Janeiro-Olympic-Games-2016.jpg',1),(101,6,'FunFact','Geography','Located near','Tropic of Capricorn',NULL,NULL,1),(102,7,'QuickFact','General','Country','Argentina',NULL,NULL,1),(103,7,'QuickFact','General','Population','3,100,000',NULL,NULL,1),(104,7,'QuickFact','Culture','Demonym','porteño(a)',NULL,NULL,1),(105,7,'QuickFact','Culture','Dance Style Birthplace','The Tango',NULL,'https://www.insightvacations.com/blog/wp-content/uploads/2023/05/Large-Young-couple-dancing-Tango-in-street-200213137-001.jpg',1),(106,7,'FunFact','Culture','Nickname','\"Paris of South America\"',NULL,NULL,1),(107,7,'FunFact','Culture','Nickname','Baires',NULL,NULL,1),(108,7,'FunFact','Culture','Nickname','Queen of the Plata',NULL,NULL,1),(109,7,'FunFact','Geography','River','Río de la Plata',NULL,NULL,1),(110,7,'FunFact','History','Founded','1536',NULL,NULL,1),(111,7,'FunFact','History','Reestablished','1580',NULL,NULL,1),(112,7,'FunFact','Culture','Famous opera house','Teatro Colón',NULL,'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGCuGnM40Cr4GXouI3Q3MjiJWIQCSG9_dBhQ&s',1),(113,7,'FunFact','Culture','City type','Autonomous City',NULL,NULL,1),(114,7,'FunFact','Culture','Global city ranking','Alpha global city',NULL,NULL,1),(115,7,'FunFact','Landmark','World\'s widest avenue','9 de Julio',NULL,'https://greatruns.com/wp-content/uploads/2017/05/avenida-9-de-julio-buenos-aires.jpeg',1),(116,7,'FunFact','Culture','Famous Author','Jorge Luis Borges',NULL,'https://upload.wikimedia.org/wikipedia/commons/8/89/Jorge_Luis_Borges_1951%2C_by_Grete_Stern_%28full%29.jpg',1),(117,8,'QuickFact','General','Population','9800000','9.8 million',NULL,1),(118,8,'QuickFact','General','Demonym','Cairene',NULL,NULL,1),(119,8,'QuickFact','Culture','Nickname','City of a Thousand Minarets',NULL,NULL,1),(120,8,'FunFact','Geography','River flowing through Cairo','Nile River',NULL,'https://www.tripsavvy.com/thmb/CJcguDmXNOqGJ21WOMt72-0NN9U=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/cairo05-56a1f4495f9b58b7d0c511ae.JPG',1),(121,8,'FunFact','History','Founded','969',NULL,NULL,1),(122,8,'FunFact','History','Earlier settlement','Fustat',NULL,NULL,1),(123,8,'FunFact','Culture','Number of hieroglyphs','700',NULL,NULL,1),(124,8,'FunFact','Culture','Mummy bandage length','1.6 km',NULL,NULL,1),(125,8,'QuickFact','Culture','Sacred animal in ancient Egypt','Cats',NULL,'https://traveling-cats.com/wp-content/uploads/2018/01/cairo-cats.jpg',1),(126,8,'QuickFact','Landmark','Oldest university in Cairo','Al-Azhar University','4.7 million','https://cdn.britannica.com/74/228474-050-267470B8/View-from-the-Citadel-of-Old-Cairo-including-the-ancient-Al-Azhar-University-and-mosque.jpg',1),(127,8,'QuickFact','Culture','UNESCO World Heritage site','Historic Cairo',NULL,NULL,1),(128,9,'QuickFact','General','Country','South Africa',NULL,NULL,1),(129,9,'QuickFact','General','Population','4772846','4.7 million',NULL,1),(130,9,'QuickFact','General','Demonym','Capetonian',NULL,NULL,1),(131,9,'QuickFact','Culture','Nickname','Mother City',NULL,NULL,1),(132,9,'QuickFact','Culture','Nickname','Tavern of the Seas',NULL,NULL,1),(133,9,'QuickFact','Culture','Motto','Spes Bona','Good Hope',NULL,1),(134,9,'QuickFact','Status','Legislative capital of South Africa','Cape Town',NULL,NULL,1),(135,9,'FunFact','History','Founded','1652',NULL,NULL,1),(136,9,'FunFact','Landmark','Famous mountain','Table Mountain',NULL,'https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg',1),(137,9,'FunFact','Landmark','Famous point','Cape Point',NULL,'https://www.atlasandboots.com/wp-content/uploads/2019/04/cape-point-feat-3.jpg',1),(138,9,'FunFact','Landmark','Historic fortress','Castle of Good Hope',NULL,'https://afar.brightspotcdn.com/dims4/default/58e7f30/2147483647/strip/false/crop/800x500+0+0/resize/800x500!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4a%2Fda%2Fe98f17162cf729a4ff90fe3c2eb6%2Foriginal-9950e12904fefb906ba6ccb84b45113d.jpg',1),(139,9,'FunFact','Culture','Named best city by','New York Times',NULL,NULL,1),(140,9,'FunFact','Culture','Popular tourist destination','Table Mountain',NULL,'https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg',1),(141,9,'FunFact','Animals','Animals that can be found in cape town','Penguins',NULL,'https://www.globeguide.ca/wp-content/uploads/2023/01/South-africa-boulders-beach-1.jpg',1),(142,9,'FunFact','People','Where did Nelson Mandela Live for 18 years','Cape Town',NULL,'https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640',1),(143,9,'FunFact','Landmark','Oldest Graden in Capetown','Company\'s Garden',NULL,'https://afar.brightspotcdn.com/dims4/default/13d8822/2147483647/strip/false/crop/800x450+0+25/resize/1200x675!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4c%2Fcb%2F9262500612c63591cb05db3302b6%2Foriginal-fc191a89f331b9390589829174597457.jpg',1),(144,9,'FunFact','People','Nelson Mandela famous speech after release','Cape Town',NULL,'https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640',1),(145,9,'FunFact','History','Significance to the Dutch East India Company back in 1652','Half way point for those travelling towards the east',NULL,NULL,1),(146,10,'QuickFact','General','Country','Australia',NULL,NULL,1),(147,10,'QuickFact','General','State','Victoria',NULL,NULL,1),(148,10,'QuickFact','General','Population','6000000','6 million',NULL,1),(149,10,'QuickFact','General','Demonym','Melburnian',NULL,NULL,1),(150,10,'QuickFact','Geography','Bay','Port Phillip Bay',NULL,'https://www.visitmelbourne.com/-/media/atdw/melbourne/see-and-do/nature-and-wildlife/national-parks-and-reserves/edd63a29b1f9f2b7d099f4f1cd5a3945_1600x1200.jpeg?ts=20251102391048',1),(151,10,'QuickFact','Geography','River','Yarra River',NULL,'https://assets.travelloapp.com/uploads/deal/highlights-of-melbourne-cruise.jpg',1),(152,10,'QuickFact','Status','Capital of','Victoria',NULL,NULL,1),(153,10,'QuickFact','Status','Population rank in Australia','Second most populous','2nd',NULL,1),(154,10,'FunFact','History','Founded','1835',NULL,NULL,1),(155,10,'FunFact','History','Named after','William Lamb',NULL,'https://upload.wikimedia.org/wikipedia/commons/4/4e/William_Lamb%2C_2nd_Viscount_Melbourne.jpg',1),(156,10,'FunFact','History','Former role','Interim capital of Australia',NULL,NULL,1),(157,10,'FunFact','Culture','Nickname','Australia\'s cultural capital',NULL,NULL,1),(158,10,'FunFact','Culture','Known for','Street art, music, coffee',NULL,NULL,1),(159,10,'FunFact','Culture','Famous phrase','Four seasons in one day',NULL,NULL,1),(160,10,'FunFact','Sports','Event','Australian Open',NULL,NULL,1),(161,10,'FunFact','Sports','Event','Melbourne Cup',NULL,NULL,1),(162,10,'FunFact','Sports','Event','Australian Grand Prix',NULL,NULL,1),(163,10,'FunFact','Sports','Venue','Melbourne Cricket Ground','MCG','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsyywqBdyA8I-42ztOIzFqEazwwWBOoFF5VQ&s',1),(164,10,'FunFact','Culture','Global ranking','Most livable city',NULL,NULL,1),(165,10,'FunFact','Culture','UNESCO title','City of Literature',NULL,NULL,1),(166,10,'FunFact','History','Years as capital before Canberra','26',NULL,NULL,1),(167,10,'FunFact','Culture','Restaurants and cafes per capita','Highest in the world',NULL,NULL,1),(168,10,'FunFact','History','First traffic lights in Australia','Melbourne',NULL,NULL,1);
/*!40000 ALTER TABLE `cityfacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citypagecontent`
--

DROP TABLE IF EXISTS `citypagecontent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citypagecontent` (
  `CityPageContentID` int NOT NULL AUTO_INCREMENT,
  `CityID` int NOT NULL,
  `PageContent` longtext,
  `LastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CityPageContentID`),
  UNIQUE KEY `CityID` (`CityID`),
  CONSTRAINT `fk_citypagecontent_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citypagecontent`
--

LOCK TABLES `citypagecontent` WRITE;
/*!40000 ALTER TABLE `citypagecontent` DISABLE KEYS */;
INSERT INTO `citypagecontent` VALUES (1,9,'<h1>Cape Town</h1><p><strong>South Africa</strong> | Africa</p><p><img class=\'city-image\' src=\'https://www.shutterstock.com/image-photo/cape-town-city-cbd-table-600nw-2337902495.jpg\' alt=\'Cape Town\'></p><p>a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain.</p><h2>Quick Facts</h2><ul><li><strong>Country:</strong> South Africa</li><li><strong>Population:</strong> 5,800,000</li><li><strong>Motto:</strong> Spes Bona</li><li><strong>Nickname:</strong> Mother City</li><li><strong>Nickname:</strong> Tavern of the Seas</li><li><strong>Demonym:</strong> Capetonian</li><li><strong>Legislative capital of South Africa:</strong> Cape Town</li></ul><h2>Location</h2><ul><li><strong>Latitude:</strong> -33.924900</li><li><strong>Longitude:</strong> 18.424100</li></ul><h2>Facts</h2><table><thead><tr><th>Fact</th><th>Image</th></tr></thead><tbody><tr><td><strong>Animals that can be found in cape town:</strong> Penguins</td><td><img class=\'fact-image\' src=\'https://www.globeguide.ca/wp-content/uploads/2023/01/South-africa-boulders-beach-1.jpg\' alt=\'Animals that can be found in cape town\'></td></tr><tr><td><strong>Named best city by:</strong> New York Times</td><td><span class=\'no-image\'>No Image</span></td></tr><tr><td><strong>Popular tourist destination:</strong> Table Mountain</td><td><img class=\'fact-image\' src=\'https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg\' alt=\'Popular tourist destination\'></td></tr><tr><td><strong>Founded:</strong> 1652</td><td><span class=\'no-image\'>No Image</span></td></tr><tr><td><strong>Significance to the Dutch East India Company back in 1652:</strong> Half way point for those travelling towards the east</td><td><span class=\'no-image\'>No Image</span></td></tr><tr><td><strong>Famous mountain:</strong> Table Mountain</td><td><img class=\'fact-image\' src=\'https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg\' alt=\'Famous mountain\'></td></tr><tr><td><strong>Famous point:</strong> Cape Point</td><td><img class=\'fact-image\' src=\'https://www.atlasandboots.com/wp-content/uploads/2019/04/cape-point-feat-3.jpg\' alt=\'Famous point\'></td></tr><tr><td><strong>Historic fortress:</strong> Castle of Good Hope</td><td><img class=\'fact-image\' src=\'https://afar.brightspotcdn.com/dims4/default/58e7f30/2147483647/strip/false/crop/800x500+0+0/resize/800x500!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4a%2Fda%2Fe98f17162cf729a4ff90fe3c2eb6%2Foriginal-9950e12904fefb906ba6ccb84b45113d.jpg\' alt=\'Historic fortress\'></td></tr><tr><td><strong>Oldest Graden in Capetown:</strong> Company\'s Garden</td><td><img class=\'fact-image\' src=\'https://afar.brightspotcdn.com/dims4/default/13d8822/2147483647/strip/false/crop/800x450+0+25/resize/1200x675!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4c%2Fcb%2F9262500612c63591cb05db3302b6%2Foriginal-fc191a89f331b9390589829174597457.jpg\' alt=\'Oldest Graden in Capetown\'></td></tr><tr><td><strong>Nelson Mandela famous speech after release:</strong> Cape Town</td><td><img class=\'fact-image\' src=\'https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640\' alt=\'Nelson Mandela famous speech after release\'></td></tr><tr><td><strong>Where did Nelson Mandela Live for 18 years:</strong> Cape Town</td><td><img class=\'fact-image\' src=\'https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640\' alt=\'Where did Nelson Mandela Live for 18 years\'></td></tr></tbody></table><h2>Sources</h2><p>Sources can be added later.</p>','2026-04-27 10:06:19'),(2,5,'<h1>Seoul</h1><p><strong>South Korea</strong> | Asia</p><p><img src=\"https://t4.ftcdn.net/jpg/02/58/00/87/360_F_258008704_rtbLWxLBUfMsryzYHEh7pfRkwEspn9XV.jpg\" alt=\"Seoul\"></p><p>the capital of South Korea, is a huge metropolis where modern skyscrapers, high-tech subways and pop culture meet Buddhist temples, palaces and street markets.</p><h2>Quick Facts</h2><ul><li><strong>Country:</strong> North Korea</li><li><strong>Population:</strong> 9,600,000</li><li><strong>Motto:</strong> Seoul, my soul</li><li><strong>Demonym:</strong> Seoulite</li><li><strong>River flowing through Seoul:</strong> Han River</li><li><strong>Capital of South Korea:</strong> Seoul</li></ul><h2>Location</h2><ul><li><strong>Latitude:</strong> 37.560000</li><li><strong>Longitude:</strong> 126.990000</li></ul><h2>Facts</h2><p>FactImage<strong>Center of:</strong> Korean WaveNo Image<strong>City known for 24-hour lifestyle:</strong> SeoulNo Image<strong>Major entertainment district:</strong> Gangnam<img src=\"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Teheran-ro_Yeongdong-daero_crossing_7.jpg/1280px-Teheran-ro_Yeongdong-daero_crossing_7.jpg\" alt=\"Major entertainment district\"><strong>Number of royal palaces:</strong> 5No Image<strong>City divided by river:</strong> Han RiverNo Image<strong>Distance from North Korea border:</strong> 35 milesNo Image<strong>Capital since:</strong> 1394No Image<strong>Founded by:</strong> Taejo of JoseonNo Image<strong>Famous observation tower:</strong> N Seoul Tower<img src=\"https://upload.wikimedia.org/wikipedia/en/a/a6/NamsanTower_%28Cropped%29.jpeg\" alt=\"Famous observation tower\"><strong>Famous royal palace:</strong> Gyeongbokgung Palace<img src=\"https://travel.usnews.com/images/Gyeongbokgung_1_Getty_Images.jpg\" alt=\"Famous royal palace\"><strong>Longest bridge fountain:</strong> Moonlight Rainbow Fountain<img src=\"https://static.wixstatic.com/media/0505b9_da9fbea9147b44e7b2ed725994c16d72~mv2.jpg/v1/fill/w_980,h_552,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/0505b9_da9fbea9147b44e7b2ed725994c16d72~mv2.jpg\" alt=\"Longest bridge fountain\"></p><h2>Sources</h2><p>Sources can be added later.</p>','2026-04-27 11:05:21');
/*!40000 ALTER TABLE `citypagecontent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citypageimages`
--

DROP TABLE IF EXISTS `citypageimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citypageimages` (
  `CityPageImageID` int NOT NULL AUTO_INCREMENT,
  `CityID` int NOT NULL,
  `ImagePath` text NOT NULL,
  `AltText` text,
  `Caption` text,
  `UploadedByUserID` int DEFAULT NULL,
  `UploadedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CityPageImageID`),
  KEY `fk_citypageimages_city` (`CityID`),
  KEY `fk_citypageimages_user` (`UploadedByUserID`),
  CONSTRAINT `fk_citypageimages_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_citypageimages_user` FOREIGN KEY (`UploadedByUserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citypageimages`
--

LOCK TABLES `citypageimages` WRITE;
/*!40000 ALTER TABLE `citypageimages` DISABLE KEYS */;
/*!40000 ALTER TABLE `citypageimages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citypagerevisions`
--

DROP TABLE IF EXISTS `citypagerevisions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citypagerevisions` (
  `RevisionID` int NOT NULL AUTO_INCREMENT,
  `CityID` int NOT NULL,
  `EditedByUserID` int DEFAULT NULL,
  `PageContent` longtext NOT NULL,
  `EditSummary` text,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RevisionID`),
  KEY `fk_citypagerevisions_user` (`EditedByUserID`),
  KEY `idx_citypagerevisions_cityid_createdat` (`CityID`,`CreatedAt`),
  CONSTRAINT `fk_citypagerevisions_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_citypagerevisions_user` FOREIGN KEY (`EditedByUserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citypagerevisions`
--

LOCK TABLES `citypagerevisions` WRITE;
/*!40000 ALTER TABLE `citypagerevisions` DISABLE KEYS */;
INSERT INTO `citypagerevisions` VALUES (1,9,1,'<p>Hello</p>','tested hello then deleted it ','2026-04-27 09:05:38'),(2,9,1,'<p><br></p>','Reset page from database facts','2026-04-27 10:05:12'),(3,9,1,'<h1>Cape Town</h1><p><strong>South Africa</strong> | Africa</p><p><img class=\'city-image\' src=\'https://www.shutterstock.com/image-photo/cape-town-city-cbd-table-600nw-2337902495.jpg\' alt=\'Cape Town\'></p><p>a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain.</p><h2>Quick Facts</h2><ul><li><strong>Country:</strong> South Africa</li><li><strong>Population:</strong> 5,800,000</li><li><strong>Motto:</strong> Spes Bona</li><li><strong>Nickname:</strong> Mother City</li><li><strong>Nickname:</strong> Tavern of the Seas</li><li><strong>Demonym:</strong> Capetonian</li><li><strong>Legislative capital of South Africa:</strong> Cape Town</li></ul><h2>Location</h2><ul><li><strong>Latitude:</strong> -33.924900</li><li><strong>Longitude:</strong> 18.424100</li></ul><h2>Facts</h2><table><thead><tr><th>Fact</th><th>Image</th></tr></thead><tbody><tr><td><strong>Animals that can be found in cape town:</strong> Penguins</td><td><img class=\'fact-image\' src=\'https://www.globeguide.ca/wp-content/uploads/2023/01/South-africa-boulders-beach-1.jpg\' alt=\'Animals that can be found in cape town\'></td></tr><tr><td><strong>Named best city by:</strong> New York Times</td><td><span class=\'no-image\'>No Image</span></td></tr><tr><td><strong>Popular tourist destination:</strong> Table Mountain</td><td><img class=\'fact-image\' src=\'https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg\' alt=\'Popular tourist destination\'></td></tr><tr><td><strong>Founded:</strong> 1652</td><td><span class=\'no-image\'>No Image</span></td></tr><tr><td><strong>Significance to the Dutch East India Company back in 1652:</strong> Half way point for those travelling towards the east</td><td><span class=\'no-image\'>No Image</span></td></tr><tr><td><strong>Famous mountain:</strong> Table Mountain</td><td><img class=\'fact-image\' src=\'https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg\' alt=\'Famous mountain\'></td></tr><tr><td><strong>Famous point:</strong> Cape Point</td><td><img class=\'fact-image\' src=\'https://www.atlasandboots.com/wp-content/uploads/2019/04/cape-point-feat-3.jpg\' alt=\'Famous point\'></td></tr><tr><td><strong>Historic fortress:</strong> Castle of Good Hope</td><td><img class=\'fact-image\' src=\'https://afar.brightspotcdn.com/dims4/default/58e7f30/2147483647/strip/false/crop/800x500+0+0/resize/800x500!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4a%2Fda%2Fe98f17162cf729a4ff90fe3c2eb6%2Foriginal-9950e12904fefb906ba6ccb84b45113d.jpg\' alt=\'Historic fortress\'></td></tr><tr><td><strong>Oldest Graden in Capetown:</strong> Company\'s Garden</td><td><img class=\'fact-image\' src=\'https://afar.brightspotcdn.com/dims4/default/13d8822/2147483647/strip/false/crop/800x450+0+25/resize/1200x675!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4c%2Fcb%2F9262500612c63591cb05db3302b6%2Foriginal-fc191a89f331b9390589829174597457.jpg\' alt=\'Oldest Graden in Capetown\'></td></tr><tr><td><strong>Nelson Mandela famous speech after release:</strong> Cape Town</td><td><img class=\'fact-image\' src=\'https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640\' alt=\'Nelson Mandela famous speech after release\'></td></tr><tr><td><strong>Where did Nelson Mandela Live for 18 years:</strong> Cape Town</td><td><img class=\'fact-image\' src=\'https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640\' alt=\'Where did Nelson Mandela Live for 18 years\'></td></tr></tbody></table><h2>Sources</h2><p>Sources can be added later.</p>','reset from database table','2026-04-27 10:05:31'),(4,9,1,'<h1>Cape Town</h1><p><strong>South Africa</strong> | Africa</p><p><img src=\"https://www.shutterstock.com/image-photo/cape-town-city-cbd-table-600nw-2337902495.jpg\" alt=\"Cape Town\"></p><p>a port city on South Africa’s southwest coast, on a peninsula beneath the imposing Table Mountain.</p><h2>Quick Facts</h2><ul><li><strong>Country:</strong> South Africa</li><li><strong>Population:</strong> 5,800,000</li><li><strong>Motto:</strong> Spes Bona</li><li><strong>Nickname:</strong> Mother City</li><li><strong>Nickname:</strong> Tavern of the Seas</li><li><strong>Demonym:</strong> Capetonian</li><li><strong>Legislative capital of South Africa:</strong> Cape Town</li></ul><h2>Location</h2><ul><li><strong>Latitude:</strong> -33.924900</li><li><strong>Longitude:</strong> 18.424100</li></ul><h2>Facts</h2><p>FactImage<strong>Animals that can be found in cape town:</strong> Penguins<img src=\"https://www.globeguide.ca/wp-content/uploads/2023/01/South-africa-boulders-beach-1.jpg\" alt=\"Animals that can be found in cape town\"><strong>Named best city by:</strong> New York TimesNo Image<strong>Popular tourist destination:</strong> Table Mountain<img src=\"https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg\" alt=\"Popular tourist destination\"><strong>Founded:</strong> 1652No Image<strong>Significance to the Dutch East India Company back in 1652:</strong> Half way point for those travelling towards the eastNo Image<strong>Famous mountain:</strong> Table Mountain<img src=\"https://cdn.britannica.com/41/75841-050-FAAE44F0/Table-Mountain-Cape-Town-Western-Bay-South.jpg\" alt=\"Famous mountain\"><strong>Famous point:</strong> Cape Point<img src=\"https://www.atlasandboots.com/wp-content/uploads/2019/04/cape-point-feat-3.jpg\" alt=\"Famous point\"><strong>Historic fortress:</strong> Castle of Good Hope<img src=\"https://afar.brightspotcdn.com/dims4/default/58e7f30/2147483647/strip/false/crop/800x500+0+0/resize/800x500!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4a%2Fda%2Fe98f17162cf729a4ff90fe3c2eb6%2Foriginal-9950e12904fefb906ba6ccb84b45113d.jpg\" alt=\"Historic fortress\"><strong>Oldest Graden in Capetown:</strong> Company\'s Garden<img src=\"https://afar.brightspotcdn.com/dims4/default/13d8822/2147483647/strip/false/crop/800x450+0+25/resize/1200x675!/quality/90/?url=https%3A%2F%2Fk3-prod-afar-media.s3.us-west-2.amazonaws.com%2Fbrightspot%2F4c%2Fcb%2F9262500612c63591cb05db3302b6%2Foriginal-fc191a89f331b9390589829174597457.jpg\" alt=\"Oldest Graden in Capetown\"><strong>Nelson Mandela famous speech after release:</strong> Cape Town<img src=\"https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640\" alt=\"Nelson Mandela famous speech after release\"><strong>Where did Nelson Mandela Live for 18 years:</strong> Cape Town<img src=\"https://maryloudriedger2.wordpress.com/wp-content/uploads/2023/02/mandela.png?w=640\" alt=\"Where did Nelson Mandela Live for 18 years\"></p><h2>Sources</h2><p>Sources can be added later.</p>','Reset page from database facts','2026-04-27 10:06:19');
/*!40000 ALTER TABLE `citypagerevisions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `CountryID` int NOT NULL AUTO_INCREMENT,
  `CountryName` varchar(100) NOT NULL,
  `RegionID` int NOT NULL,
  `FlagImagePath` text,
  PRIMARY KEY (`CountryID`),
  UNIQUE KEY `CountryName` (`CountryName`),
  KEY `fk_countries_region` (`RegionID`),
  CONSTRAINT `fk_countries_region` FOREIGN KEY (`RegionID`) REFERENCES `regions` (`RegionID`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'United States of America',1,'https://flagpedia.net/data/flags/w1160/us.webp'),(2,'Canada',1,'https://flagpedia.net/data/flags/w1160/ca.webp'),(3,'Mexico',3,'https://flagpedia.net/data/flags/w1160/mx.webp'),(4,'Panama',3,'https://flagpedia.net/data/flags/w1160/pa.webp'),(5,'Jamaica',4,'https://flagpedia.net/data/flags/w1160/jm.webp'),(6,'Cuba',4,'https://flagpedia.net/data/flags/w1160/cu.webp'),(7,'Brazil',2,'https://flagpedia.net/data/flags/w1160/br.webp'),(8,'Argentina',2,'https://flagpedia.net/data/flags/w1160/ar.webp'),(9,'Chile',2,'https://flagpedia.net/data/flags/w1160/cl.webp'),(10,'France',5,'https://flagpedia.net/data/flags/w1160/fr.webp'),(11,'Germany',5,'https://flagpedia.net/data/flags/w1160/de.webp'),(12,'Italy',5,'https://flagpedia.net/data/flags/w1160/it.webp'),(13,'Spain',5,'https://flagpedia.net/data/flags/w1160/es.webp'),(14,'Saudi Arabia',8,'https://flagpedia.net/data/flags/w1160/sa.webp'),(15,'Israel',8,'https://flagpedia.net/data/flags/w1160/il.webp'),(16,'India',7,'https://flagpedia.net/data/flags/w1160/in.webp'),(17,'China',7,'https://flagpedia.net/data/flags/w1160/cn.webp'),(18,'Japan',7,'https://flagpedia.net/data/flags/w1160/jp.webp'),(19,'Australia',9,'https://flagpedia.net/data/flags/w1160/au.webp'),(20,'South Africa',6,'https://flagpedia.net/data/flags/w1160/za.webp'),(21,'Scotland',5,'https://flagpedia.net/data/flags/w1160/gb-sct.webp'),(22,'Norway',5,'https://flagpedia.net/data/flags/w1160/no.webp'),(23,'Finland',5,'https://flagpedia.net/data/flags/w1160/fi.webp'),(24,'Poland',5,'https://flagpedia.net/data/flags/w1160/pl.webp'),(25,'Greece',5,'https://flagpedia.net/data/flags/w1160/gr.webp'),(26,'Portugal',5,'https://flagpedia.net/data/flags/w1160/pt.webp'),(27,'Netherlands',5,'https://flagpedia.net/data/flags/w1160/nl.webp'),(28,'Belgium',5,'https://flagpedia.net/data/flags/w1160/be.webp'),(29,'Iran',8,'https://flagpedia.net/data/flags/w1160/ir.webp'),(30,'Iraq',8,'https://flagpedia.net/data/flags/w1160/iq.webp'),(31,'Indonesia',7,'https://flagpedia.net/data/flags/w1160/id.webp'),(32,'Ireland',5,'https://flagpedia.net/data/flags/w1160/ie.webp'),(33,'Sweden',5,'https://flagpedia.net/data/flags/w1160/se.webp'),(34,'Turkey',8,'https://flagpedia.net/data/flags/w1160/tr.webp'),(35,'Jordan',8,'https://flagpedia.net/data/flags/w1160/jo.webp'),(36,'Kuwait',8,'https://flagpedia.net/data/flags/w1160/kw.webp'),(37,'Thailand',7,'https://flagpedia.net/data/flags/w1160/th.webp'),(38,'Vietnam',7,'https://flagpedia.net/data/flags/w1160/vn.webp'),(39,'Philippines',7,'https://flagpedia.net/data/flags/w1160/ph.webp'),(40,'New Zealand',9,'https://flagpedia.net/data/flags/w1160/nz.webp'),(41,'South Korea',7,'https://flagpedia.net/data/flags/w1160/kr.webp'),(42,'North Korea',7,'https://flagpedia.net/data/flags/w1160/kp.webp'),(43,'Egypt',6,'https://flagpedia.net/data/flags/w1160/eg.webp'),(44,'Nigeria',6,'https://flagpedia.net/data/flags/w1160/ng.webp'),(45,'Kenya',6,'https://flagpedia.net/data/flags/w1160/ke.webp'),(46,'Morocco',6,'https://flagpedia.net/data/flags/w1160/ma.webp'),(47,'Pakistan',7,'https://flagpedia.net/data/flags/w1160/pk.webp'),(48,'Bangladesh',7,'https://flagpedia.net/data/flags/w1160/bd.webp'),(49,'Malaysia',7,'https://flagpedia.net/data/flags/w1160/my.webp'),(50,'Papua New Guinea',9,'https://flagpedia.net/data/flags/w1160/pg.webp'),(51,'Palestine',8,'https://flagpedia.net/data/flags/w1160/ps.webp');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customquestions`
--

DROP TABLE IF EXISTS `customquestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customquestions` (
  `CustomQuestionID` int NOT NULL AUTO_INCREMENT,
  `CityID` int NOT NULL,
  `QuestionType` varchar(10) NOT NULL,
  `QuestionText` text NOT NULL,
  `CorrectAnswer` text NOT NULL,
  `WrongAnswer1` text,
  `WrongAnswer2` text,
  `WrongAnswer3` text,
  `Explanation` text,
  `Difficulty` varchar(20) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  `ImagePath` text,
  PRIMARY KEY (`CustomQuestionID`),
  KEY `fk_customquestions_city` (`CityID`),
  CONSTRAINT `fk_customquestions_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `chk_customquestions_qtype` CHECK ((`QuestionType` in (_utf8mb4'MC',_utf8mb4'TF',_utf8mb4'FB',_utf8mb4'MC_IMAGE')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customquestions`
--

LOCK TABLES `customquestions` WRITE;
/*!40000 ALTER TABLE `customquestions` DISABLE KEYS */;
/*!40000 ALTER TABLE `customquestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcardsessioncards`
--

DROP TABLE IF EXISTS `flashcardsessioncards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcardsessioncards` (
  `FlashcardCardID` int NOT NULL AUTO_INCREMENT,
  `FlashcardSessionID` int NOT NULL,
  `CityID` int NOT NULL,
  `FactID` int DEFAULT NULL,
  `FrontText` text NOT NULL,
  `BackText` text NOT NULL,
  `OrderShown` int NOT NULL,
  PRIMARY KEY (`FlashcardCardID`),
  KEY `fk_flashcardcards_session` (`FlashcardSessionID`),
  KEY `fk_flashcardcards_city` (`CityID`),
  KEY `fk_flashcardcards_fact` (`FactID`),
  CONSTRAINT `fk_flashcardcards_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_flashcardcards_fact` FOREIGN KEY (`FactID`) REFERENCES `cityfacts` (`FactID`),
  CONSTRAINT `fk_flashcardcards_session` FOREIGN KEY (`FlashcardSessionID`) REFERENCES `flashcardsessions` (`FlashcardSessionID`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcardsessioncards`
--

LOCK TABLES `flashcardsessioncards` WRITE;
/*!40000 ALTER TABLE `flashcardsessioncards` DISABLE KEYS */;
INSERT INTO `flashcardsessioncards` VALUES (1,1,9,128,'Cape Town - Country','South Africa',1),(2,1,9,129,'Cape Town - Population','4772846',2),(3,1,9,130,'Cape Town - Demonym','Capetonian',3),(4,1,9,131,'Cape Town - Nickname','Mother City',4),(5,1,9,132,'Cape Town - Nickname','Tavern of the Seas',5),(6,1,9,133,'Cape Town - Motto','Spes Bona',6),(7,1,9,134,'Cape Town - Legislative capital of South Africa','Cape Town',7),(8,1,9,135,'Cape Town - Founded','1652',8),(9,1,9,136,'Cape Town - Famous mountain','Table Mountain',9),(10,1,9,137,'Cape Town - Famous point','Cape Point',10),(11,1,9,138,'Cape Town - Historic fortress','Castle of Good Hope',11),(12,1,9,139,'Cape Town - Named best city by','New York Times',12),(13,1,9,140,'Cape Town - Popular tourist destination','Table Mountain',13),(14,1,9,141,'Cape Town - Animals that can be found in cape town','Penguins',14),(15,1,9,142,'Cape Town - Where did Nelson Mandela Live for 18 years','Cape Town',15),(16,1,9,143,'Cape Town - Oldest Graden in Capetown','Company\'s Garden',16),(17,1,9,144,'Cape Town - Nelson Mandela famous speech after release','Cape Town',17),(18,1,9,145,'Cape Town - Significance to the Dutch East India Company back in 1652','Half way point for those travelling towards the east',18),(19,2,7,102,'Buenos Aires - Country','Argentina',1),(20,2,7,103,'Buenos Aires - Population','3,100,000',2),(21,2,7,104,'Buenos Aires - Demonym','porteño(a)',3),(22,2,7,105,'Buenos Aires - Dance Style Birthplace','The Tango',4),(23,2,7,106,'Buenos Aires - Nickname','\"Paris of South America\"',5),(24,2,7,107,'Buenos Aires - Nickname','Baires',6),(25,2,7,108,'Buenos Aires - Nickname','Queen of the Plata',7),(26,2,7,109,'Buenos Aires - River','Río de la Plata',8),(27,2,7,110,'Buenos Aires - Founded','1536',9),(28,2,7,111,'Buenos Aires - Reestablished','1580',10),(29,2,7,112,'Buenos Aires - Famous opera house','Teatro Colón',11),(30,2,7,113,'Buenos Aires - City type','Autonomous City',12),(31,2,7,114,'Buenos Aires - Global city ranking','Alpha global city',13),(32,2,7,115,'Buenos Aires - World\'s widest avenue','9 de Julio',14),(33,2,7,116,'Buenos Aires - Famous Author','Jorge Luis Borges',15);
/*!40000 ALTER TABLE `flashcardsessioncards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcardsessioncities`
--

DROP TABLE IF EXISTS `flashcardsessioncities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcardsessioncities` (
  `FlashcardSessionID` int NOT NULL,
  `CityID` int NOT NULL,
  PRIMARY KEY (`FlashcardSessionID`,`CityID`),
  KEY `fk_flashcardsessioncities_city` (`CityID`),
  CONSTRAINT `fk_flashcardsessioncities_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_flashcardsessioncities_session` FOREIGN KEY (`FlashcardSessionID`) REFERENCES `flashcardsessions` (`FlashcardSessionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcardsessioncities`
--

LOCK TABLES `flashcardsessioncities` WRITE;
/*!40000 ALTER TABLE `flashcardsessioncities` DISABLE KEYS */;
INSERT INTO `flashcardsessioncities` VALUES (2,7),(1,9);
/*!40000 ALTER TABLE `flashcardsessioncities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcardsessions`
--

DROP TABLE IF EXISTS `flashcardsessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcardsessions` (
  `FlashcardSessionID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Mode` varchar(50) NOT NULL,
  `DateUsed` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SelectedRegionID` int DEFAULT NULL,
  `RequestedCityCount` int DEFAULT NULL,
  `SelectedCityID` int DEFAULT NULL,
  PRIMARY KEY (`FlashcardSessionID`),
  KEY `fk_flashcardsessions_user` (`UserID`),
  KEY `fk_flashcardsessions_region` (`SelectedRegionID`),
  KEY `fk_flashcardsessions_city` (`SelectedCityID`),
  CONSTRAINT `fk_flashcardsessions_city` FOREIGN KEY (`SelectedCityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_flashcardsessions_region` FOREIGN KEY (`SelectedRegionID`) REFERENCES `regions` (`RegionID`),
  CONSTRAINT `fk_flashcardsessions_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcardsessions`
--

LOCK TABLES `flashcardsessions` WRITE;
/*!40000 ALTER TABLE `flashcardsessions` DISABLE KEYS */;
INSERT INTO `flashcardsessions` VALUES (1,1,'flashcards','2026-04-27 08:31:11',NULL,NULL,9),(2,3,'flashcards','2026-04-27 11:00:52',NULL,NULL,7);
/*!40000 ALTER TABLE `flashcardsessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leaderboard`
--

DROP TABLE IF EXISTS `leaderboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leaderboard` (
  `LeaderboardID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `TotalQuizPoints` int NOT NULL DEFAULT '0',
  `QuizzesCompleted` int NOT NULL DEFAULT '0',
  `AverageScore` decimal(5,2) NOT NULL DEFAULT '0.00',
  `BestScore` int NOT NULL DEFAULT '0',
  `LastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LeaderboardID`),
  UNIQUE KEY `UserID` (`UserID`),
  CONSTRAINT `fk_leaderboard_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leaderboard`
--

LOCK TABLES `leaderboard` WRITE;
/*!40000 ALTER TABLE `leaderboard` DISABLE KEYS */;
INSERT INTO `leaderboard` VALUES (1,1,0,0,0.00,0,'2026-04-27 05:16:03'),(2,2,0,0,0.00,0,'2026-04-27 08:55:59'),(3,3,800,1,800.00,800,'2026-04-27 11:02:00');
/*!40000 ALTER TABLE `leaderboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questiontemplates`
--

DROP TABLE IF EXISTS `questiontemplates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questiontemplates` (
  `TemplateID` int NOT NULL AUTO_INCREMENT,
  `QuestionType` varchar(10) NOT NULL,
  `TemplateText` text NOT NULL,
  `AnswerSource` varchar(50) NOT NULL,
  `RequiredFactType` varchar(50) DEFAULT NULL,
  `RequiredFactSubtype` varchar(50) DEFAULT NULL,
  `RequiredFactLabel` varchar(100) DEFAULT NULL,
  `ImageSourceType` varchar(50) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`TemplateID`),
  CONSTRAINT `chk_templates_qtype` CHECK ((`QuestionType` in (_utf8mb4'MC',_utf8mb4'TF',_utf8mb4'FB',_utf8mb4'MC_IMAGE')))
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questiontemplates`
--

LOCK TABLES `questiontemplates` WRITE;
/*!40000 ALTER TABLE `questiontemplates` DISABLE KEYS */;
INSERT INTO `questiontemplates` VALUES (1,'MC','What country is {CityName} located in?','FactValue','QuickFact','General','Country',NULL,1),(2,'TF','True or False: {CityName} is located in {FactValue}.','FactValue','QuickFact','General','Country',NULL,1),(3,'FB','{CityName} is located in ________.','FactValue','QuickFact','General','Country',NULL,1),(4,'MC','What is the approximate population of {CityName}?','FactValue','QuickFact','General','Population',NULL,1),(5,'FB','The population of {CityName} is about ________.','FactValue','QuickFact','General','Population',NULL,1),(6,'TF','True or False: The population of {CityName} is around {FactValue}.','FactValue','QuickFact','General','Population',NULL,1),(7,'MC','What is the demonym, or what people from {CityName} are called?','FactValue','QuickFact','General','Demonym',NULL,1),(8,'FB','A person from {CityName} is called a ________.','FactValue','QuickFact','General','Demonym',NULL,1),(9,'TF','True or False: People from {CityName} are called {FactValue}.','FactValue','QuickFact','General','Demonym',NULL,1),(10,'MC','What is the elevation of {CityName}?','FactValue','QuickFact','Geography','Elevation',NULL,1),(11,'FB','The elevation of {CityName} is ________.','FactValue','QuickFact','Geography','Elevation',NULL,1),(12,'TF','True or False: {CityName} has an elevation of {FactValue}.','FactValue','QuickFact','Geography','Elevation',NULL,1),(13,'MC','What was {CityName} named after?','FactValue','QuickFact','Culture','Named After',NULL,1),(14,'FB','{CityName} was named after ________.','FactValue','QuickFact','Culture','Named After',NULL,1),(15,'TF','True or False: {CityName} was named after {FactValue}.','FactValue','QuickFact','Culture','Named After',NULL,1),(16,'MC','What is the nickname of {CityName}?','FactValue','QuickFact','Culture','Nickname',NULL,1),(17,'FB','The nickname of {CityName} is ________.','FactValue','QuickFact','Culture','Nickname',NULL,1),(18,'TF','True or False: One nickname of {CityName} is {FactValue}.','FactValue','QuickFact','Culture','Nickname',NULL,1),(19,'MC','What is the motto of {CityName}?','FactValue','QuickFact','Culture','Motto',NULL,1),(20,'FB','The motto of {CityName} is ________.','FactValue','QuickFact','Culture','Motto',NULL,1),(21,'TF','True or False: The motto of {CityName} is {FactValue}.','FactValue','QuickFact','Culture','Motto',NULL,1),(22,'MC','When was {CityName} founded?','FactValue','QuickFact','History','Founded',NULL,1),(23,'FB','{CityName} was founded in ________.','FactValue','QuickFact','History','Founded',NULL,1),(24,'TF','True or False: {CityName} was founded in {FactValue}.','FactValue','QuickFact','History','Founded',NULL,1),(25,'MC','What is the official tree of {CityName}?','FactValue','QuickFact','Symbol','Official Tree','FactImage',1),(26,'MC','What is the official flower of {CityName}?','FactValue','QuickFact','Symbol','Official Flower','FactImage',1),(27,'MC','What is the official plant of {CityName}?','FactValue','QuickFact','Symbol','Official Plant','FactImage',1),(28,'MC','What river is associated with {CityName}?','FactValue','QuickFact','Geography','River',NULL,1),(29,'MC','What bay is associated with {CityName}?','FactValue','QuickFact','Geography','Bay','FactImage',1),(30,'MC','What is the state/province of {CityName}?','FactValue','QuickFact','General','State',NULL,1),(31,'MC','What is the capital status of {CityName}?','FactLabel','QuickFact','Status',NULL,NULL,1),(32,'MC','What answer matches this clue: {FactLabel}?','FactValue','FunFact','Landmark',NULL,'FactImage',1),(33,'FB','{FactLabel}: ________.','FactValue','FunFact','Landmark',NULL,'FactImage',1),(34,'TF','True or False: {FactLabel}: {FactValue}.','FactValue','FunFact','Landmark',NULL,'FactImage',1),(35,'MC','What answer matches this clue: {FactLabel}?','FactValue','FunFact','Culture',NULL,'FactImage',1),(36,'FB','{FactLabel}: ________.','FactValue','FunFact','Culture',NULL,'FactImage',1),(37,'TF','True or False: {FactLabel}: {FactValue}.','FactValue','FunFact','Culture',NULL,'FactImage',1),(38,'MC','What answer matches this clue: {FactLabel}?','FactValue','FunFact','History',NULL,'FactImage',1),(39,'FB','{FactLabel}: ________.','FactValue','FunFact','History',NULL,'FactImage',1),(40,'TF','True or False: {FactLabel}: {FactValue}.','FactValue','FunFact','History',NULL,'FactImage',1),(41,'MC','What answer matches this clue: {FactLabel}?','FactValue','FunFact','Geography',NULL,'FactImage',1),(42,'FB','{FactLabel}: ________.','FactValue','FunFact','Geography',NULL,'FactImage',1),(43,'TF','True or False: {FactLabel}: {FactValue}.','FactValue','FunFact','Geography',NULL,'FactImage',1),(44,'MC','What answer matches this clue: {FactLabel}?','FactValue','FunFact','Event',NULL,'FactImage',1),(45,'TF','True or False: {CityName} is associated with this event: {FactLabel}.','FactValue','FunFact','Event',NULL,'FactImage',1),(46,'MC','What answer matches this clue: {FactLabel}?','FactValue','FunFact','Sports',NULL,'FactImage',1),(47,'TF','True or False: {FactLabel}: {FactValue}.','FactValue','FunFact','Sports',NULL,'FactImage',1),(48,'MC','What animal fact matches this clue: {FactLabel}?','FactValue','FunFact','Animals',NULL,'FactImage',1),(49,'TF','True or False: {FactValue} can be found in {CityName}.','FactValue','FunFact','Animals',NULL,'FactImage',1),(50,'MC','What person-related answer matches this clue: {FactLabel}?','FactValue','FunFact','People',NULL,'FactImage',1),(51,'TF','True or False: {FactLabel}: {FactValue}.','FactValue','FunFact','People',NULL,'FactImage',1),(52,'MC','What country does this flag belong to?','CountryName','QuickFact','General','Country','Flag',1),(53,'FB','This flag belongs to the country ________.','CountryName','QuickFact','General','Country','Flag',1),(54,'TF','True or False: This is the flag of the country where {CityName} is located.','CountryName','QuickFact','General','Country','Flag',1),(55,'MC_IMAGE','Which flag represents the country of {CityName}?','CountryFlag','QuickFact','General','Country','FlagChoices',1),(56,'TF','True or False: This flag represents the country of {CityName}.','CountryName','QuickFact','General','Country','Flag',1),(57,'MC','Which city is shown in this image?','CityName',NULL,NULL,NULL,'CityImage',1),(58,'TF','True or False: This image shows {CityName}.','CityName',NULL,NULL,NULL,'CityImage',1);
/*!40000 ALTER TABLE `questiontemplates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizattemptcities`
--

DROP TABLE IF EXISTS `quizattemptcities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizattemptcities` (
  `QuizAttemptID` int NOT NULL,
  `CityID` int NOT NULL,
  PRIMARY KEY (`QuizAttemptID`,`CityID`),
  KEY `fk_quizattemptcities_city` (`CityID`),
  CONSTRAINT `fk_quizattemptcities_attempt` FOREIGN KEY (`QuizAttemptID`) REFERENCES `quizattempts` (`QuizAttemptID`),
  CONSTRAINT `fk_quizattemptcities_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizattemptcities`
--

LOCK TABLES `quizattemptcities` WRITE;
/*!40000 ALTER TABLE `quizattemptcities` DISABLE KEYS */;
INSERT INTO `quizattemptcities` VALUES (1,7),(2,8);
/*!40000 ALTER TABLE `quizattemptcities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizattemptquestions`
--

DROP TABLE IF EXISTS `quizattemptquestions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizattemptquestions` (
  `QuizAttemptQuestionID` int NOT NULL AUTO_INCREMENT,
  `QuizAttemptID` int NOT NULL,
  `TemplateID` int DEFAULT NULL,
  `CustomQuestionID` int DEFAULT NULL,
  `CityID` int NOT NULL,
  `QuestionText` text NOT NULL,
  `CorrectAnswer` text NOT NULL,
  `UserAnswer` text,
  `IsCorrect` tinyint(1) NOT NULL,
  PRIMARY KEY (`QuizAttemptQuestionID`),
  KEY `fk_quizattemptquestions_attempt` (`QuizAttemptID`),
  KEY `fk_quizattemptquestions_template` (`TemplateID`),
  KEY `fk_quizattemptquestions_custom` (`CustomQuestionID`),
  KEY `fk_quizattemptquestions_city` (`CityID`),
  CONSTRAINT `fk_quizattemptquestions_attempt` FOREIGN KEY (`QuizAttemptID`) REFERENCES `quizattempts` (`QuizAttemptID`),
  CONSTRAINT `fk_quizattemptquestions_city` FOREIGN KEY (`CityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_quizattemptquestions_custom` FOREIGN KEY (`CustomQuestionID`) REFERENCES `customquestions` (`CustomQuestionID`),
  CONSTRAINT `fk_quizattemptquestions_template` FOREIGN KEY (`TemplateID`) REFERENCES `questiontemplates` (`TemplateID`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizattemptquestions`
--

LOCK TABLES `quizattemptquestions` WRITE;
/*!40000 ALTER TABLE `quizattemptquestions` DISABLE KEYS */;
INSERT INTO `quizattemptquestions` VALUES (1,1,55,NULL,7,'Which flag represents the country of Buenos Aires?','https://flagpedia.net/data/flags/w1160/ar.webp','https://flagpedia.net/data/flags/w1160/ar.webp',1),(2,1,37,NULL,7,'True or False: Global city ranking: Alpha global city.','True','False',0),(3,1,35,NULL,7,'What answer matches this clue: Nickname?','Baires','Baires',1),(4,1,36,NULL,7,'City type: ________.','Autonomous City','Buenos Aires',0),(5,1,4,NULL,7,'What is the approximate population of Buenos Aires?','3,100,000','9800000',0),(6,2,58,NULL,8,'True or False: This image shows Cairo.','True','True',1),(7,2,16,NULL,8,'What is the nickname of Cairo?','City of a Thousand Minarets','Mother City',0),(8,2,37,NULL,8,'True or False: Number of hieroglyphs: 700.','True','False',0),(9,2,7,NULL,8,'What is the demonym, or what people from Cairo are called?','Cairene','Seoulite',0),(10,2,4,NULL,8,'What is the approximate population of Cairo?','9800000','3,898,747',0),(11,2,9,NULL,8,'True or False: People from Cairo are called Cairene.','True','False',0),(12,2,38,NULL,8,'What answer matches this clue: Founded?','969','969',1),(13,2,42,NULL,8,'River flowing through Cairo: ________.','Nile River','tidle',0),(14,2,36,NULL,8,'Number of hieroglyphs: ________.','700','700',1),(15,2,37,NULL,8,'True or False: Mummy bandage length: 1.6 km.','True','True',1),(16,2,5,NULL,8,'The population of Cairo is about ________.','9800000','800000',0),(17,2,6,NULL,8,'True or False: The population of Cairo is around 9800000.','True','True',1),(18,2,40,NULL,8,'True or False: Earlier settlement: Fustat.','True','False',0),(19,2,8,NULL,8,'A person from Cairo is called a ________.','Cairene','cairo',0),(20,2,43,NULL,8,'True or False: River flowing through Cairo: Nile River.','True','True',1);
/*!40000 ALTER TABLE `quizattemptquestions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizattempts`
--

DROP TABLE IF EXISTS `quizattempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizattempts` (
  `QuizAttemptID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Mode` varchar(50) NOT NULL,
  `Timed` tinyint(1) NOT NULL DEFAULT '0',
  `Difficulty` varchar(20) NOT NULL,
  `Score` int NOT NULL,
  `PlayedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `SelectedRegionID` int DEFAULT NULL,
  `RequestedCityCount` int DEFAULT NULL,
  `SelectedCityID` int DEFAULT NULL,
  `Status` varchar(20) NOT NULL DEFAULT 'completed',
  PRIMARY KEY (`QuizAttemptID`),
  KEY `fk_quizattempts_user` (`UserID`),
  KEY `fk_quizattempts_region` (`SelectedRegionID`),
  KEY `fk_quizattempts_city` (`SelectedCityID`),
  CONSTRAINT `fk_quizattempts_city` FOREIGN KEY (`SelectedCityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_quizattempts_region` FOREIGN KEY (`SelectedRegionID`) REFERENCES `regions` (`RegionID`),
  CONSTRAINT `fk_quizattempts_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`),
  CONSTRAINT `chk_quizattempts_difficulty` CHECK ((`Difficulty` in (_utf8mb4'easy',_utf8mb4'medium',_utf8mb4'hard'))),
  CONSTRAINT `chk_quizattempts_status` CHECK ((`Status` in (_utf8mb4'completed',_utf8mb4'abandoned',_utf8mb4'in_progress')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizattempts`
--

LOCK TABLES `quizattempts` WRITE;
/*!40000 ALTER TABLE `quizattempts` DISABLE KEYS */;
INSERT INTO `quizattempts` VALUES (1,3,'quiz',1,'easy',800,'2026-04-27 11:02:00',NULL,1,7,'completed'),(2,1,'quiz',1,'hard',5367,'2026-04-27 11:11:08',NULL,1,8,'completed');
/*!40000 ALTER TABLE `quizattempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `RegionID` int NOT NULL AUTO_INCREMENT,
  `RegionCode` varchar(10) NOT NULL,
  `RegionName` varchar(100) NOT NULL,
  PRIMARY KEY (`RegionID`),
  UNIQUE KEY `RegionCode` (`RegionCode`),
  UNIQUE KEY `RegionName` (`RegionName`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES (1,'NA','North America'),(2,'SA','South America'),(3,'CA','Central America'),(4,'CB','Caribbean'),(5,'EU','Europe'),(6,'AF','Africa'),(7,'AS','Asia'),(8,'ME','Middle East'),(9,'OA','Oceania'),(10,'AN','Antarctica');
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userprofiles`
--

DROP TABLE IF EXISTS `userprofiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userprofiles` (
  `ProfileID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `DisplayName` varchar(100) NOT NULL,
  `Bio` text,
  `ProfileImagePath` text,
  `FavoriteRegionID` int DEFAULT NULL,
  `FavoriteCityID` int DEFAULT NULL,
  PRIMARY KEY (`ProfileID`),
  UNIQUE KEY `UserID` (`UserID`),
  KEY `fk_profiles_region` (`FavoriteRegionID`),
  KEY `fk_profiles_city` (`FavoriteCityID`),
  CONSTRAINT `fk_profiles_city` FOREIGN KEY (`FavoriteCityID`) REFERENCES `cities` (`CityID`),
  CONSTRAINT `fk_profiles_region` FOREIGN KEY (`FavoriteRegionID`) REFERENCES `regions` (`RegionID`),
  CONSTRAINT `fk_profiles_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userprofiles`
--

LOCK TABLES `userprofiles` WRITE;
/*!40000 ALTER TABLE `userprofiles` DISABLE KEYS */;
INSERT INTO `userprofiles` VALUES (1,1,'testadmin',NULL,NULL,NULL,NULL),(2,2,'user1',NULL,NULL,NULL,NULL),(3,3,'user2',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `userprofiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `PasswordHash` text NOT NULL,
  `UserType` varchar(20) NOT NULL,
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Username` (`Username`),
  CONSTRAINT `chk_users_usertype` CHECK ((`UserType` in (_utf8mb4'user',_utf8mb4'admin')))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'testadmin','$2b$10$FSjejQcemDqp86JRJN0peOEdyxm1lFntxeVtL4D7UEFUq1NN0.Ok6','admin','2026-04-27 05:16:03',0),(2,'user1','$2b$10$F4xr1mGLtamba5TTF69q1eXrd.8yuKbN2ppRqVlUSZKllR5.CuEOS','user','2026-04-27 08:55:59',0),(3,'user2','$2b$10$12rUqUS.UqwTjBKmxhOX5elyt.TeTQmKOgtxB/9gIOwPbOjgLY23W','user','2026-04-27 11:00:24',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userstatistics`
--

DROP TABLE IF EXISTS `userstatistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userstatistics` (
  `UserStatsID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `LastQuizAttemptedAt` datetime DEFAULT NULL,
  `QuizzesCompleted` int NOT NULL DEFAULT '0',
  `AverageScore` decimal(5,2) NOT NULL DEFAULT '0.00',
  `MostDoneQuizMode` varchar(50) DEFAULT NULL,
  `BestScore` int NOT NULL DEFAULT '0',
  `TotalQuizPoints` int NOT NULL DEFAULT '0',
  `FlashcardSessionsUsed` int NOT NULL DEFAULT '0',
  `LastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserStatsID`),
  UNIQUE KEY `UserID` (`UserID`),
  CONSTRAINT `fk_userstatistics_user` FOREIGN KEY (`UserID`) REFERENCES `users` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userstatistics`
--

LOCK TABLES `userstatistics` WRITE;
/*!40000 ALTER TABLE `userstatistics` DISABLE KEYS */;
INSERT INTO `userstatistics` VALUES (1,1,NULL,0,0.00,NULL,0,0,1,'2026-04-27 08:31:11'),(3,2,NULL,0,0.00,NULL,0,0,0,'2026-04-27 08:55:59'),(4,3,'2026-04-27 11:02:00',1,400.00,'quiz',800,800,1,'2026-04-27 11:02:00');
/*!40000 ALTER TABLE `userstatistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `websitestatistics`
--

DROP TABLE IF EXISTS `websitestatistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `websitestatistics` (
  `WebsiteStatsID` int NOT NULL AUTO_INCREMENT,
  `TotalUsers` int NOT NULL DEFAULT '0',
  `TotalAdmins` int NOT NULL DEFAULT '0',
  `TotalRegularUsers` int NOT NULL DEFAULT '0',
  `TotalQuizzesCompleted` int NOT NULL DEFAULT '0',
  `AverageQuizScore` decimal(5,2) NOT NULL DEFAULT '0.00',
  `HighestQuizScore` int NOT NULL DEFAULT '0',
  `MostPopularQuizMode` varchar(50) DEFAULT NULL,
  `TotalFlashcardSessions` int NOT NULL DEFAULT '0',
  `LastUpdated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`WebsiteStatsID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `websitestatistics`
--

LOCK TABLES `websitestatistics` WRITE;
/*!40000 ALTER TABLE `websitestatistics` DISABLE KEYS */;
/*!40000 ALTER TABLE `websitestatistics` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-28 18:14:46
