CREATE PROCEDURE `new_procedure` (IN search varchar(255))
BEGIN
SELECT * FROM membres
where LOWER(CONCAT(nomMembre , ' ' , prenomMembre , ' ' )) like concat('%', lower(search), '%')
or LOWER(CONCAT(prenomMembre , ' ' , nomMembre , ' ' )) like concat('%', lower(search), '%');
END
