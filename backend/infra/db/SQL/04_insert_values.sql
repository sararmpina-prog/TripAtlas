INSERT INTO users (
    first_name,
    surname,
    email,
    mobile_phone,
    password_hash,
    created_at
) VALUES
('Ana', 'Ramos', 'ana.ramos@email.com', '+965550105', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzgxOTQ4NTcyLCJleHAiOjE3ODE5NTIxNzJ9.TlDj00ajRmhZoZFdiO7-Hh-bIWohbcDRDieq5oyeUMs'), -- "password": "PassSecreta123*"
('Ana', 'Furtado', 'anafurtado@email.com', '+351911234567', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzgxOTQ4NjkyLCJleHAiOjE3ODE5NTIyOTJ9.7-rcxoCLc7ybZozVlnk2zNERqNX1m49RGbxjNjF8RXg'), -- "password": "testeAF1-"
('David', 'Miller', 'david.m@email.com', '+965550106', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzgxOTQ4ODYzLCJleHAiOjE3ODE5NTI0NjN9.ud_nPD54Uo6Q0AdbQQqHC7Y07idI7PpWGDp1BGvVY3k'), -- "password": "registerDavid123!"
('Yuki', 'Tanaka', 'yuki.t@email.com', '+819012345678', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiaWF0IjoxNzgxOTQ4OTc4LCJleHAiOjE3ODE5NTI1Nzh9.JbHmhzdO6ouRQfsiZ0DHDv9hiV3K1bOdbJuGW-YBTwo'), -- "password": "YukiNow1--"
('Elena', 'Petrova', 'elena.p@email.com', '+79012345678', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwiaWF0IjoxNzgxOTQ5MDgzLCJleHAiOjE3ODE5NTI2ODN9.1-xYW0x__-h3WIaxvJfggJaqnhttfTZCjxSvzNLvTm0'); -- "password": "123456Ep-"

INSERT INTO trips (
    user_id,
    title,
    description,
    destination,
    start_date,
    end_date
) VALUES
(1, 'Summer Vacation in Rome', 'Exploring the Colosseum and historic Italian sites.', 'Rome, Italy', '2026-07-10', '2026-07-17'),
(2, 'London Business & Sightseeing', 'Attending fintech conference and visiting museums.', 'London, UK', '2026-08-05', '2026-08-12'),
(3, 'New York City Getaway', 'Broadway shows, Central Park, and shopping.', 'New York, USA', '2026-09-20', '2026-09-27'),
(2, 'Paris Fashion Week', 'Attending runway shows and exploring Montmartre.', 'Paris, France', '2026-09-25', '2026-10-02'),
(4, 'Tokyo Tech Tour', 'Visiting Akihabara, teamLab, and local sushi spots.', 'Tokyo, Japan', '2026-10-15', '2026-10-25'),
(2, 'Relaxing Bali Escape', 'Beachfront resort relaxation and temple tours.', 'Bali, Indonesia', '2026-11-01', '2026-11-10'),
(1, 'Iceland Northern Lights', 'Chasing the aurora borealis and visiting hot springs.', 'Reykjavik, Iceland', '2026-12-05', '2026-12-12'),
(3, 'Dubai Luxury Shopping', 'Exploring Dubai Mall and desert safari adventures.', 'Dubai, UAE', '2027-01-15', '2027-01-22'),
(1, 'Sydney Coastal Walk', 'Opera house views and Bondi beach coastal treks.', 'Sydney, Australia', '2027-02-10', '2027-02-20'),
(5, 'Alps Ski Adventure', 'Skiing in Chamonix and cozy chalet stays.', 'Chamonix, France', '2027-03-01', '2027-03-08');

INSERT INTO flights (
	trip_id,
    flight_number,
    airline,
    departure_airport,
    arrival_airport,
    departure_datetime,
    arrival_datetime,
    direction
) VALUES
-- Trip 1 (Rome, Italy | Jul 10 - Jul 17)
(1, 'AZ203', 'ITA Airways', 'LHR', 'FCO', '2026-07-10 08:00:00', '2026-07-10 11:30:00', 'outbound'),
(1, 'AZ204', 'ITA Airways', 'FCO', 'LHR', '2026-07-17 16:20:00', '2026-07-17 19:50:00', 'return'),
-- Trip 2 (London, UK | Aug 05 - Aug 12)
(2, 'BA142', 'British Airways', 'JFK', 'LHR', '2026-08-04 21:00:00', '2026-08-05 09:00:00', 'outbound'),
(2, 'BA143', 'British Airways', 'LHR', 'JFK', '2026-08-12 14:30:00', '2026-08-12 17:15:00', 'return'),
-- Trip 3 (New York, USA | Sep 20 - Sep 27)
(3, 'IB316', 'Iberia', 'MAD', 'JFK', '2026-09-20 12:15:00', '2026-09-20 14:45:00', 'outbound'),
(3, 'IB317', 'Iberia', 'JFK', 'MAD', '2026-09-27 19:30:00', '2026-09-28 08:50:00', 'return'),
-- Trip 4 (Paris, France | Sep 25 - Oct 02)
(4, 'AF114', 'Air France', 'LIS', 'CDG', '2026-09-25 06:15:00', '2026-09-25 09:45:00', 'outbound'),
(4, 'AF115', 'Air France', 'CDG', 'LIS', '2026-10-02 16:00:00', '2026-10-02 18:20:00', 'return'),
-- Trip 5 (Tokyo, Japan | Oct 15 - Oct 25)
(5, 'QR042', 'Qatar Airways', 'CDG', 'DOH', '2026-10-14 16:00:00', '2026-10-14 23:25:00', 'outbound'),
(5, 'QR812', 'Qatar Airways', 'DOH', 'HND', '2026-10-15 02:00:00', '2026-10-15 16:30:00', 'outbound'),
(5, 'QR813', 'Qatar Airways', 'HND', 'DOH', '2026-10-25 23:55:00', '2026-10-26 05:30:00', 'return'),
(5, 'QR039', 'Qatar Airways', 'DOH', 'CDG', '2026-10-26 08:00:00', '2026-10-26 13:40:00', 'return'),
-- Trip 6 (Bali, Indonesia | Nov 01 - Nov 10)
(6, 'SQ942', 'Singapore Airlines', 'SIN', 'DPS', '2026-11-01 09:15:00', '2026-11-01 11:50:00', 'outbound'),
(6, 'SQ943', 'Singapore Airlines', 'DPS', 'SIN', '2026-11-10 18:20:00', '2026-11-10 21:00:00', 'return'),
-- Trip 7 (Reykjavik, Iceland | Dec 05 - Dec 12)
(7, 'FI501', 'Icelandair', 'FRA', 'KEF', '2026-12-05 13:20:00', '2026-12-05 16:05:00', 'outbound'),
(7, 'FI502', 'Icelandair', 'KEF', 'FRA', '2026-12-12 07:40:00', '2026-12-12 12:15:00', 'return'),
-- Trip 8 (Dubai, UAE | Jan 15 - Jan 22)
(8, 'EK201', 'Emirates', 'LHR', 'DXB', '2027-01-14 20:15:00', '2027-01-15 07:20:00', 'outbound'),
(8, 'EK202', 'Emirates', 'DXB', 'LHR', '2027-01-22 08:30:00', '2027-01-22 12:55:00', 'return'),
-- Trip 9 (Sydney, Australia | Feb 10 - Feb 20)
(9, 'BA015', 'British Airways', 'LHR', 'SIN', '2027-02-08 21:05:00', '2027-02-09 17:30:00', 'outbound'),
(9, 'BA015', 'British Airways', 'SIN', 'SYD', '2027-02-09 19:00:00', '2027-02-10 06:00:00', 'outbound'),
-- Return: Sydney (SYD) -> Singapore (SIN) -> London (LHR)
(9, 'SQ212', 'Singapore Airlines', 'SYD', 'SIN', '2027-02-20 09:05:00', '2027-02-20 14:15:00', 'return'),
(9, 'SQ322', 'Singapore Airlines', 'SIN', 'LHR', '2027-02-20 23:45:00', '2027-02-21 05:55:00', 'return'),
-- Trip 10 (Chamonix, France | Mar 01 - Mar 08)
-- Note: Geneva (GVA) is the main international airport used to access the Chamonix region.
(10, 'U2394', 'EasyJet', 'LGW', 'GVA', '2027-03-01 07:10:00', '2027-03-01 09:45:00', 'outbound');

INSERT INTO accommodations (
    name,
    address,
    city,
    country
) VALUES
('Hotel Artemide', 'Via Nazionale 22', 'Rome', 'Italy'),
('The Savoy', 'Strand', 'London', 'UK'),
('The Plaza Hotel', '768 5th Ave', 'New York', 'USA'),
('Hotel Regina', '2 Place des Pyramides', 'Paris', 'France'),
('Hotel Gracery Shinjuku', '1-19-1 Kabukicho', 'Tokyo', 'Japan'),
('Ayana Resort Bali', 'Jl. Karang Mas Sejahtera', 'Bali', 'Indonesia'),
('Sand Hotel', 'Laugavegur 34', 'Reykjavik', 'Iceland'),
('Burj Al Arab', 'Jumeirah St', 'Dubai', 'UAE'),
('Park Hyatt Sydney', '7 Hickson Rd', 'Sydney', 'Australia'),
('Les Balcons de Chamonix', '140 Place Saussure', 'Chamonix', 'France'),
('Kyoto Ryokan庵', '544 Teppocho, Shimogyo Ward', 'Kyoto', 'Japan');

INSERT INTO accommodation_reserve (
    accommodation_id,
    trip_id,
    check_in_date,
    check_out_date,
    check_in_time,
    check_out_time
) VALUES
(1, 1, '2026-07-10', '2026-07-17', '14:00:00', '11:00:00'),
(2, 2, '2026-08-05', '2026-08-12', '15:00:00', '12:00:00'),
(3, 3, '2026-09-20', '2026-09-27', '16:00:00', '11:00:00'),
(4, 4, '2026-09-25', '2026-10-02', '14:00:00', '12:00:00'),
(5, 5, '2026-10-15', '2026-10-20', '15:00:00', '11:00:00'),
(11, 5, '2026-10-20', '2026-10-25', '15:00:00', '10:00:00'),
(6, 6, '2026-11-01', '2026-11-10', '14:00:00', '12:00:00'),
(7, 7, '2026-12-05', '2026-12-12', '15:00:00', '11:00:00'),
(8, 8, '2027-01-15', '2027-01-22', '15:00:00', '12:00:00'),
(9, 9, '2027-02-10', '2027-02-20', '14:00:00', '11:00:00'),
(10, 10, '2027-03-01', '2027-03-08', '16:00:00', '10:00:00');

-- viagens complementares para testes de reservas e voos:

INSERT INTO trips (
    user_id,
    title,
    description,
    destination,
    start_date,
    end_date
) VALUES
(4, 'Portugal Coastal Road Trip', 'Road trip from Porto to Algarve with scenic stops along the Atlantic coast.', 'Portugal', '2027-04-10', '2027-04-18');

INSERT INTO accommodations (
    name,
    address,
    city,
    country
) VALUES
('PortoBay Flores', 'Rua das Flores 27', 'Porto', 'Portugal'),
('Memmo Alfama Hotel', 'Travessa das Merceeiras 27', 'Lisbon', 'Portugal'),
('EPIC SANA Algarve Hotel', 'Praia da Falésia', 'Albufeira', 'Portugal');

INSERT INTO accommodation_reserve (
    accommodation_id,
    trip_id,
    check_in_date,
    check_out_date,
    check_in_time,
    check_out_time
) VALUES
(12, 11, '2027-04-10', '2027-04-13', '15:00:00', '12:00:00'),
(13, 11, '2027-04-13', '2027-04-15', '15:00:00', '11:00:00'),
(14, 11, '2027-04-15', '2027-04-18', '16:00:00', '11:00:00');

INSERT INTO trips (
    user_id,
    title,
    description,
    destination,
    start_date,
    end_date
) VALUES
(5, 'Visiting Friends in Berlin', 'Staying with friends while exploring Berlin nightlife and cultural landmarks.', 'Berlin, Germany', '2027-05-12', '2027-05-18');

INSERT INTO flights (
    trip_id,
    flight_number,
    airline,
    departure_airport,
    arrival_airport,
    departure_datetime,
    arrival_datetime,
    direction
) VALUES
(12, 'TP532', 'TAP Air Portugal', 'LIS', 'BER', '2027-05-12 08:10:00', '2027-05-12 12:20:00', 'outbound'),
(12, 'TP533', 'TAP Air Portugal', 'BER', 'LIS', '2027-05-18 18:00:00', '2027-05-18 20:30:00', 'return');

INSERT INTO trips (
    user_id,
    title,
    description,
    destination,
    start_date,
    end_date
) VALUES
(3, 'Chicago Architecture & Blues Tour', 'Exploring architecture cruises, jazz clubs and iconic Chicago food.', 'Chicago, USA', '2027-06-05', '2027-06-12');

INSERT INTO flights (
    trip_id,
    flight_number,
    airline,
    departure_airport,
    arrival_airport,
    departure_datetime,
    arrival_datetime,
    direction
) VALUES
(13, 'IB3123', 'Iberia', 'LIS', 'MAD', '2027-06-05 06:35:00', '2027-06-05 08:55:00', 'outbound'),
(13, 'IB6275', 'Iberia', 'MAD', 'ORD', '2027-06-05 11:15:00', '2027-06-05 13:45:00', 'outbound'),
(13, 'TP244', 'TAP Air Portugal', 'ORD', 'LIS', '2027-06-12 20:10:00', '2027-06-13 10:00:00', 'return');

INSERT INTO accommodations (
    name,
    address,
    city,
    country
) VALUES
('The Palmer House Hilton', '17 E Monroe St', 'Chicago', 'USA');

INSERT INTO accommodation_reserve (
    accommodation_id,
    trip_id,
    check_in_date,
    check_out_date,
    check_in_time,
    check_out_time
) VALUES
(15, 13, '2027-06-05', '2027-06-12', '15:00:00', '11:00:00');

-- ai suggestions:
INSERT INTO ai_suggestions (
    trip_id,
    title,
    content
) VALUES

-- Portugal Coastal Road Trip
(
    11,
    'Sunset stop at Cabo da Roca',
    'On the drive between Lisbon and the Algarve, consider stopping at Cabo da Roca, the westernmost point of continental Europe. The cliffs offer spectacular Atlantic Ocean views, especially around sunset. Bring a light jacket as the wind can be strong even during warmer months.'
),

(
    11,
    'Explore the historic centre of Aveiro',
    'Before heading south, spend a few hours in Aveiro. Take a ride on a traditional moliceiro boat through the canals, walk around the Art Nouveau district and try the local ovos moles. It is an excellent stop to break up the drive between Porto and Lisbon.'
),

-- Chicago Architecture & Blues Tour
(
    13,
    'Chicago River Architecture Cruise',
    'Book an architecture cruise along the Chicago River during your first days in the city. Local guides explain the history behind iconic skyscrapers such as the Wrigley Building, Marina City and Willis Tower. The tour is considered one of the best introductions to Chicago.'
),

(
    13,
    'Live blues night at Kingston Mines',
    'Reserve an evening for live blues music at Kingston Mines in Lincoln Park. The venue regularly hosts local and touring musicians and offers an authentic Chicago blues experience. Arrive early to secure a good seat and enjoy dinner before the performances begin.'
);