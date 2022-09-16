DROP TABLE IF EXISTS `labels_print_queue`;
CREATE TABLE `labels_print_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `scheduled_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `barcode` varchar(20) NOT NULL,
  `labelsize` text NOT NULL,
  `pdf` MEDIUMBLOB NOT NULL,
  `status` TEXT NOT NULL,
  `name` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
