CREATE USER IF NOT EXISTS 'gssb'@'localhost' IDENTIFIED BY 'gssblib';
CREATE DATABASE IF NOT EXISTS spils;
GRANT ALL PRIVILEGES ON spils.* TO 'gssb'@'localhost' WITH GRANT OPTION;
