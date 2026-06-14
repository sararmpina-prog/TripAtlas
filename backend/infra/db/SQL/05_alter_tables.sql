ALTER TABLE accommodations
ADD CONSTRAINT uq_accommodation
UNIQUE (name, city, country);

ALTER TABLE accommodation_reserve
ADD CONSTRAINT unique_reservation
UNIQUE (
  accommodation_id,
  trip_id,
  check_in_date,
  check_out_date
);


ALTER TABLE users
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN locked_until TIMESTAMP NULL;

ALTER TABLE chat_history
ADD COLUMN user_id INT NULL,
MODIFY COLUMN trip_id INT NULL;