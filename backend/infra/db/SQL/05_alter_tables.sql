ALTER TABLE accommodations
ADD CONSTRAINT uq_accommodation
UNIQUE (
  name,
  city,
  country
);

ALTER TABLE accommodation_reserve
ADD CONSTRAINT unique_reservation
UNIQUE (
  accommodation_id,
  trip_id,
  check_in_date,
  check_out_date
);