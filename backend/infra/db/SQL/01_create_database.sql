-- Created database; select and use
-- Created tables

CREATE DATABASE tripatlas; 

-- Use right db
USE tripatlas; 


-- Validate right db (optional: after USE statement)
SELECT DATABASE(); 


-- APAGAR A BASE DE DADOS ANTIGA (Cuidado: isto apaga todos os dados anteriores!)
DROP DATABASE IF EXISTS tripatlas;