DROP TABLE IF EXISTS `item_covers`;
CREATE TABLE `item_covers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `barcode` varchar(20) NOT NULL,
  `mimetype` text NOT NULL,
  `image` MEDIUMBLOB,
  PRIMARY KEY (`id`),
  KEY `barcode` (`barcode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
