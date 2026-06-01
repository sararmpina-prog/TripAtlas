INSERT INTO users (
    first_name,
    surname,
    email,
    mobile_phone,
    password_hash,
    created_at
) VALUES
('Miguel', 'Silva', 'miguel@email.com', '912345678', 'hash1', NOW()),
('Ana', 'Santos', 'ana@email.com', '913333333', 'hash2', NOW()),
('João', 'Pereira', 'joao@email.com', '914444444', 'hash3', NOW()),
('Inês', 'Costa', 'ines@email.com', '915555555', 'hash4', NOW()),
('Pedro', 'Martins', 'pedro@email.com', '916666666', 'hash5', NOW());


INSERT INTO trips (
    user_id,
    title,
    description,
    destination,
    start_date,
    end_date
) VALUES
(1, 'Férias em Paris', 'Viagem romântica de 5 dias em Paris', 'Paris, France', '2026-06-01', '2026-06-05'),
(2, 'Tokyo Adventure', 'Explorar cultura e tecnologia no Japão', 'Tokyo, Japan', '2026-06-10', '2026-06-20'),
(3, 'Road Trip Espanha', 'Viagem de carro por várias cidades espanholas', 'Spain', '2026-07-01', '2026-07-10'),
(1, 'New York Business', 'Viagem de trabalho e reuniões em NYC', 'New York, USA', '2026-05-15', '2026-05-18'),
(4, 'Dubai Luxury', 'Experiência de luxo em hotéis e desertos', 'Dubai, UAE', '2026-08-01', '2026-08-07'),
(5, 'Londres Cultural', 'Museus, teatro e história em Londres', 'London, UK', '2026-09-10', '2026-09-15'),
(2, 'Barcelona Weekend', 'Fim de semana relaxante em Barcelona', 'Barcelona, Spain', '2026-06-25', '2026-06-28'),
(3, 'Singapura Explorer', 'Descobrir uma cidade futurista', 'Singapore', '2026-10-01', '2026-10-08'),
(4, 'Berlim História', 'Viagem cultural focada em história europeia', 'Berlin, Germany', '2026-11-05', '2026-11-10'),
(5, 'Lisboa Escape', 'Férias curtas na capital portuguesa', 'Lisbon, Portugal', '2026-12-20', '2026-12-24');

INSERT INTO flights (
    trip_id,
    flight_number,
    airline,
    departure_airport,
    arrival_airport,
    departure_datetime,
    arrival_datetime
) VALUES
(1, 'TP123', 'TAP Air Portugal', 'LIS', 'JFK', '2026-06-01 08:00:00', '2026-06-01 12:00:00'), -- Mudado 21 -> 1
(2, 'FR456', 'Ryanair', 'OPO', 'MAD', '2026-06-02 09:30:00', '2026-06-02 11:00:00'),          -- Mudado 22 -> 2
(3, 'JL789', 'Japan Airlines', 'CDG', 'HND', '2026-06-03 13:00:00', '2026-06-04 08:00:00'),   -- Mudado 23 -> 3
(4, 'BA321', 'British Airways', 'LHR', 'LIS', '2026-06-04 07:15:00', '2026-06-04 10:00:00'),   -- Mudado 24 -> 4
(5, 'LH654', 'Lufthansa', 'FRA', 'DXB', '2026-06-05 22:00:00', '2026-06-06 06:00:00'),         -- Mudado 25 -> 5
(6, 'AF987', 'Air France', 'CDG', 'BCN', '2026-06-06 10:00:00', '2026-06-06 11:30:00'),         -- Mudado 26 -> 6
(7, 'SQ111', 'Singapore Airlines', 'SIN', 'SYD', '2026-06-07 20:00:00', '2026-06-08 06:00:00'),   -- Mudado 27 -> 7
(8, 'DL222', 'Delta Airlines', 'JFK', 'LAX', '2026-06-08 15:00:00', '2026-06-08 18:00:00'),     -- Mudado 28 -> 8
(9, 'EK333', 'Emirates', 'DXB', 'NRT', '2026-06-09 23:00:00', '2026-06-10 13:00:00'),          -- Mudado 29 -> 9
(10, 'IB444', 'Iberia', 'MAD', 'LIS', '2026-06-10 08:30:00', '2026-06-10 09:45:00');           -- Mudado 30 -> 10

INSERT INTO accommodations (
    name,
    city,
    country
) VALUES
('Hotel Lisboa Plaza', 'Lisboa', 'Portugal'),
('Pestana CR7', 'Funchal', 'Portugal'),
('Yotel Tokyo', 'Tokyo', 'Japan'),
('Hilton Paris Opera', 'Paris', 'France'),
('The Hoxton', 'London', 'United Kingdom'),
('Hotel Arts Barcelona', 'Barcelona', 'Spain'),
('Marina Bay Sands', 'Singapore', 'Singapore'),
('Grand Hyatt New York', 'New York', 'USA'),
('Ritz-Carlton Berlin', 'Berlin', 'Germany'),
('Four Seasons Dubai', 'Dubai', 'United Arab Emirates');


INSERT INTO accommodation_reserve (
    accommodation_id,
    trip_id,
    check_in_date,
    check_out_date
) VALUES
(1, 10, '2026-12-20', '2026-12-24'),  -- Mudado 30 -> 10 | Lisboa Escape → Hotel Lisboa Plaza
(2, 5, '2026-08-01', '2026-08-07'),   -- Mudado 25 -> 5  | Dubai Luxury → Pestana CR7
(3, 2, '2026-06-10', '2026-06-20'),   -- Mudado 22 -> 2  | Tokyo Adventure → Yotel Tokyo
(4, 1, '2026-06-01', '2026-06-05'),   -- Mudado 21 -> 1  | Paris trip → Hilton Paris Opera
(5, 6, '2026-09-10', '2026-09-15'),   -- Mudado 26 -> 6  | Londres Cultural → The Hoxton
(6, 3, '2026-07-01', '2026-07-10'),   -- Mudado 23 -> 3  | Road Trip Espanha → Hotel Arts Barcelona
(7, 8, '2026-10-01', '2026-10-08'),   -- Mudado 28 -> 8  | Singapura Explorer → Marina Bay Sands
(8, 4, '2026-05-15', '2026-05-18'),   -- Mudado 24 -> 4  | New York Business → Grand Hyatt New York
(9, 9, '2026-11-05', '2026-11-10'),   -- Mudado 29 -> 9  | Berlim História → Ritz-Carlton Berlin
(10, 7, '2026-06-25', '2026-06-28');  -- Mudado 27 -> 7  | Barcelona Weekend → Four Seasons Dubai
