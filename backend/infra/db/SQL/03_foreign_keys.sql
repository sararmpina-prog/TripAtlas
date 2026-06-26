-- Foreign keys

ALTER TABLE trips
ADD CONSTRAINT fk_trips_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE accommodation_reserve
ADD CONSTRAINT fk_accommodation_reserve_trip
FOREIGN KEY (trip_id)
REFERENCES trips(id)
ON DELETE CASCADE;

ALTER TABLE accommodation_reserve
ADD CONSTRAINT fk_accommodation_reserve_accommodation
FOREIGN KEY (accommodation_id)
REFERENCES accommodations(id)
ON DELETE CASCADE;

ALTER TABLE flights
ADD CONSTRAINT fk_flights_trip
FOREIGN KEY (trip_id)
REFERENCES trips(id)
ON DELETE CASCADE;

ALTER TABLE chat_history
ADD CONSTRAINT fk_chat_history_user
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE chat_history
ADD CONSTRAINT fk_chat_history_trip
FOREIGN KEY (trip_id)
REFERENCES trips(id)
ON DELETE CASCADE;

ALTER TABLE ai_suggestions
ADD CONSTRAINT fk_ai_suggestions_trip
FOREIGN KEY (trip_id)
REFERENCES trips(id)
ON DELETE CASCADE;
