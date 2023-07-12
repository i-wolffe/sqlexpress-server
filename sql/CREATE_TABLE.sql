DROP TABLE `testing`.`Auth`;
CREATE TABLE IF NOT EXISTS Auth (
	idUser INT AUTO_INCREMENT,
    userName VARCHAR(50) NOT NULL,
    userMail VARCHAR(50) NOT NULL,
    userAccess VARCHAR(65) NOT NULL,
    userPassword VARCHAR(65) NOT NULL,
    IsActive BOOL NOT NULL,
    PRIMARY KEY (idUser,userMail)
)  ENGINE=INNODB;
DESCRIBE Auth