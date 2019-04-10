CREATE TABLE IF NOT EXISTS `flights` (
  `toPlace` varchar(50) NOT NULL,
  `fromPlace` varchar(50) DEFAULT NULL,
  `rating` enum('1','2','3','4','5') DEFAULT NULL,
  `departure_date` varchar(50) NOT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `IX_SERIES_RATING` (`rating`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(50) NOT NULL,
  `password` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=MyISAM AUTO_INCREMENT=1 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `tickets` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `price` int(10) NOT NULL,
  `id_user` bigint(20) NOT NULL,
  `id_flight` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

DROP TRIGGER IF EXISTS `TRG_Users_OnInsert`;

CREATE TRIGGER `TRG_Users_OnInsert` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
  SET NEW.password = md5(NEW.password);
END

DROP TRIGGER IF EXISTS `TRG_Users_OnUpdate`;

CREATE TRIGGER `TRG_Users_OnUpdate` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
  SET NEW.password = md5(NEW.password);
END

COMMIT;
