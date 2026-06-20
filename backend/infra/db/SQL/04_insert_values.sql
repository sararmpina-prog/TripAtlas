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
(11, 'AZ203', 'ITA Airways', 'LHR', 'FCO', '2026-07-10 08:00:00', '2026-07-10 11:30:00', 'outbound'),
(11, 'AZ204', 'ITA Airways', 'FCO', 'LHR', '2026-07-17 16:20:00', '2026-07-17 19:50:00', 'return'),
-- Trip 2 (London, UK | Aug 05 - Aug 12)
(12, 'BA142', 'British Airways', 'JFK', 'LHR', '2026-08-04 21:00:00', '2026-08-05 09:00:00', 'outbound'),
(12, 'BA143', 'British Airways', 'LHR', 'JFK', '2026-08-12 14:30:00', '2026-08-12 17:15:00', 'return'),
-- Trip 3 (New York, USA | Sep 20 - Sep 27)
(13, 'IB316', 'Iberia', 'MAD', 'JFK', '2026-09-20 12:15:00', '2026-09-20 14:45:00', 'outbound'),
(13, 'IB317', 'Iberia', 'JFK', 'MAD', '2026-09-27 19:30:00', '2026-09-28 08:50:00', 'return'),
-- Trip 4 (Paris, France | Sep 25 - Oct 02)
(14, 'AF114', 'Air France', 'LIS', 'CDG', '2026-09-25 06:15:00', '2026-09-25 09:45:00', 'outbound'),
(14, 'AF115', 'Air France', 'CDG', 'LIS', '2026-10-02 16:00:00', '2026-10-02 18:20:00', 'return'),
-- Trip 5 (Tokyo, Japan | Oct 15 - Oct 25)
(15, 'QR042', 'Qatar Airways', 'CDG', 'DOH', '2026-10-14 16:00:00', '2026-10-14 23:25:00', 'outbound'),
(15, 'QR812', 'Qatar Airways', 'DOH', 'HND', '2026-10-15 02:00:00', '2026-10-15 16:30:00', 'outbound'),
(15, 'QR813', 'Qatar Airways', 'HND', 'DOH', '2026-10-25 23:55:00', '2026-10-26 05:30:00', 'return'),
(15, 'QR039', 'Qatar Airways', 'DOH', 'CDG', '2026-10-26 08:00:00', '2026-10-26 13:40:00', 'return'),
-- Trip 6 (Bali, Indonesia | Nov 01 - Nov 10)
(16, 'SQ942', 'Singapore Airlines', 'SIN', 'DPS', '2026-11-01 09:15:00', '2026-11-01 11:50:00', 'outbound'),
(16, 'SQ943', 'Singapore Airlines', 'DPS', 'SIN', '2026-11-10 18:20:00', '2026-11-10 21:00:00', 'return'),
-- Trip 7 (Reykjavik, Iceland | Dec 05 - Dec 12)
(17, 'FI501', 'Icelandair', 'FRA', 'KEF', '2026-12-05 13:20:00', '2026-12-05 16:05:00', 'outbound'),
(17, 'FI502', 'Icelandair', 'KEF', 'FRA', '2026-12-12 07:40:00', '2026-12-12 12:15:00', 'return'),
-- Trip 8 (Dubai, UAE | Jan 15 - Jan 22)
(18, 'EK201', 'Emirates', 'LHR', 'DXB', '2027-01-14 20:15:00', '2027-01-15 07:20:00', 'outbound'),
(18, 'EK202', 'Emirates', 'DXB', 'LHR', '2027-01-22 08:30:00', '2027-01-22 12:55:00', 'return'),
-- Trip 9 (Sydney, Australia | Feb 10 - Feb 20)
(19, 'BA015', 'British Airways', 'LHR', 'SIN', '2027-02-08 21:05:00', '2027-02-09 17:30:00', 'outbound'),
(19, 'BA015', 'British Airways', 'SIN', 'SYD', '2027-02-09 19:00:00', '2027-02-10 06:00:00', 'outbound'),
-- Return: Sydney (SYD) -> Singapore (SIN) -> London (LHR)
(19, 'SQ212', 'Singapore Airlines', 'SYD', 'SIN', '2027-02-20 09:05:00', '2027-02-20 14:15:00', 'return'),
(19, 'SQ322', 'Singapore Airlines', 'SIN', 'LHR', '2027-02-20 23:45:00', '2027-02-21 05:55:00', 'return'),
-- Trip 10 (Chamonix, France | Mar 01 - Mar 08)
-- Note: Geneva (GVA) is the main international airport used to access the Chamonix region.
(20, 'U2394', 'EasyJet', 'LGW', 'GVA', '2027-03-01 07:10:00', '2027-03-01 09:45:00', 'outbound');

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
(1, 11, '2026-07-10', '2026-07-17', '14:00:00', '11:00:00'),
(2, 12, '2026-08-05', '2026-08-12', '15:00:00', '12:00:00'),
(3, 13, '2026-09-20', '2026-09-27', '16:00:00', '11:00:00'),
(4, 14, '2026-09-25', '2026-10-02', '14:00:00', '12:00:00'),
(5, 15, '2026-10-15', '2026-10-20', '15:00:00', '11:00:00'),
(11, 15, '2026-10-20', '2026-10-25', '15:00:00', '10:00:00'),
(6, 16, '2026-11-01', '2026-11-10', '14:00:00', '12:00:00'),
(7, 17, '2026-12-05', '2026-12-12', '15:00:00', '11:00:00'),
(8, 18, '2027-01-15', '2027-01-22', '15:00:00', '12:00:00'),
(9, 19, '2027-02-10', '2027-02-20', '14:00:00', '11:00:00'),
(10, 20, '2027-03-01', '2027-03-08', '16:00:00', '10:00:00');
