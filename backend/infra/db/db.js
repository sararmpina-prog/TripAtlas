/* Camada de infraestrutura de base de dados (MySQL).

  Responsabilidades:
  - configuração e gestão do pool de ligações
  - exposição de interface única de acesso à base de dados
  - garantia de encoding e consistência de datas
  - evolução defensiva do schema (migrations simples em runtime)

  Este módulo não contém lógica de negócio.
  Apenas assegura que a base de dados está disponível e consistente.
*/

import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Definição defensiva das Tabelas do Schema Atualizado
const tableStatements = [
  `
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      first_name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      mobile_phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS trips (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      title VARCHAR(100) NOT NULL,
      description TEXT, -- CORREÇÃO: Sincronizado para TEXT
      destination VARCHAR(150) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS accommodations (
      id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(150) NOT NULL,
      city VARCHAR(100),
      country VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS accommodation_reserve (
      id INT PRIMARY KEY AUTO_INCREMENT,
      accommodation_id INT NOT NULL,
      trip_id INT NOT NULL,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS flights (
      id INT PRIMARY KEY AUTO_INCREMENT,
      trip_id INT NOT NULL,
      flight_number VARCHAR(25),
      airline VARCHAR(100),
      departure_airport VARCHAR(15),
      arrival_airport VARCHAR(15),
      departure_datetime TIMESTAMP NULL, -- CORREÇÃO: Sincronizado para TIMESTAMP NULL
      arrival_datetime TIMESTAMP NULL,   -- CORREÇÃO: Sincronizado para TIMESTAMP NULL
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS chat_history (
      id INT PRIMARY KEY AUTO_INCREMENT,
      trip_id INT NOT NULL,
      user_message TEXT,
      ai_response MEDIUMTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ai_suggestions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      trip_id INT NOT NULL,
      title VARCHAR(100),
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `
];

// Definição defensiva das Chaves Estrangeiras e Restrições Únicas
const foreignKeyStatements = [
  {
    name: 'fk_trips_user',
    statement: `
      ALTER TABLE trips
      ADD CONSTRAINT fk_trips_user
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `,
  },
  {
    name: 'fk_accommodation_reserve_trip',
    statement: `
      ALTER TABLE accommodation_reserve
      ADD CONSTRAINT fk_accommodation_reserve_trip
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    `,
  },
  {
    name: 'fk_accommodation_reserve_accommodation',
    statement: `
      ALTER TABLE accommodation_reserve
      ADD CONSTRAINT fk_accommodation_reserve_accommodation
      FOREIGN KEY (accommodation_id) REFERENCES accommodations(id) ON DELETE CASCADE
    `,
  },
  {
    name: 'fk_flights_trip',
    statement: `
      ALTER TABLE flights
      ADD CONSTRAINT fk_flights_trip
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    `,
  },
  {
    name: 'fk_chat_history_trip',
    statement: `
      ALTER TABLE chat_history
      ADD CONSTRAINT fk_chat_history_trip
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    `,
  },
  {
    name: 'fk_ai_suggestions_trip',
    statement: `
      ALTER TABLE ai_suggestions
      ADD CONSTRAINT fk_ai_suggestions_trip
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    `,
  },
  // Restrições Únicas do ficheiro 05 para evitar duplicações no Auto-Heal
  {
    name: 'uq_accommodation',
    statement: `
      ALTER TABLE accommodations
      ADD CONSTRAINT uq_accommodation UNIQUE (name, city, country)
    `,
  },
  {
    name: 'unique_reservation',
    statement: `
      ALTER TABLE accommodation_reserve
      ADD CONSTRAINT unique_reservation UNIQUE (accommodation_id, trip_id, check_in_date, check_out_date)
    `,
  }
];

// Configuração do pool de conexões


export function hasDatabaseConfig() {
  return [
    process.env.DB_HOST,
    process.env.DB_USER,
    process.env.DB_NAME,
  ].every((value) => typeof value === 'string' && value.trim() !== '');
}

/* Pool de ligações MySQL.

  Objetivo:
  - reutilização de conexões para melhor performance
  - evitar overhead de criação/fecho de ligações por query
  - suportar concorrência de operações no backend
*/
export const db = mysql
    .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        dateStrings: true, // dateStrings: evita problemas de timezone entre Node e MySQL
        connectionLimit: 10, // controlo de concorrência da pool
        charset: "utf8mb4", // suporte completo a acentos e emojis
    })
    .promise();

async function ensureForeignKey(constraintName, statement) {
  const [rows] = await db.execute(
    `
      SELECT CONSTRAINT_NAME
      FROM information_schema.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND CONSTRAINT_NAME = ?
      LIMIT 1
    `,
    [constraintName]
  );

  if (rows.length === 0) {
    await db.execute(statement);
  }
}

export async function ensureTripAtlasSchema() {
  for (const statement of tableStatements) {
    await db.execute(statement);
  }

  for (const foreignKey of foreignKeyStatements) {
    await ensureForeignKey(foreignKey.name, foreignKey.statement);
  }
}

/*
  Nota arquitetural:

  Este módulo implementa um sistema de auto-healing schema.

  Em vez de depender de migrations formais, o sistema:
  - verifica estrutura em runtime
  - corrige inconsistências automaticamente
  - mantém compatibilidade com versões antigas da base de dados

  Trade-off:
  + alta resiliência em desenvolvimento
  - menos controlo formal de versionamento de schema
*/