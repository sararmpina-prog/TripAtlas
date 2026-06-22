# AUTHENTICATION

## POST http://localhost:3000/api/auth/register
### SUCCESS
{
  "first_name": "Carlos",
  "surname": "Antunes",
  "email": "carlos@email.com",
  "mobile_phone": "+351919999999",
  "password": "supersecretpassword123!"
}
* **Expected Result**: Code 201 Created. Returns JWT token and user profile data without password_hash.

## POST http://localhost:3000/api/auth/login
### SUCCESS
{
  "email": "carlos@email.com",
  "password": "supersecretpassword123"
}
* **Expected Result**: Code 200 OK with JSON containing the bearer token.

---

# HOW TO TEST PROTECTED ROUTES
Protected routes require the global auth barrier. 
Doing `GET http://localhost:3000/api/trips` directly results in `401 Unauthorized`.

To open the routes in Thunder Client:
1. Copy the token text received from a successful Login.
2. In your route request, go to the **Headers** tab.
3. Add a header named `Authorization`.
4. Enter the value as `Bearer <your_copied_token>` (e.g., Bearer eyJhbGciOi...).
5. Click Send.

---

# GET (DATA RETRIEVAL)
GET http://localhost:3000/api/users
GET http://localhost:3000/api/trips
GET http://localhost:3000/api/flights
GET http://localhost:3000/api/accommodations
GET http://localhost:3000/api/accommodations/reserve

---

# POST (DATA CREATION)

## POST http://localhost:3000/api/users
### SUCCESS
{
  "first_name": "Anna",
  "surname": "Fields",
  "email": "annafields@email.com",
  "mobile_phone": "+442079460999",
  "password": "securepassword987"
}
* **Expected Result**: Code 201 Created. Returns the new user (id: 11) with English timestamps format.

### FAIL (Mobile phone containing letters)
{
  "first_name": "Ray",
  "surname": "Smith",
  "email": "raysmith@email.com",
  "mobile_phone": "912-TEXT-78",
  "password": "123"
}
* **Expected Result**: 400 Bad Request | "The field mobile_phone contains invalid characters."

### FAIL (Badly formatted email)
{
  "first_name": "Ray",
  "surname": "Smith",
  "email": "raysmith.com",
  "mobile_phone": "+15550199",
  "password": "123"
}
* **Expected Result**: 400 Bad Request | "The field email must be a valid email address."


## POST http://localhost:3000/api/trips
### SUCCESS
{
  "user_id": 1,
  "title": "Summer Eurotrip 2026",
  "description": "Backpacking through central Europe with college friends.",
  "destination": "Amsterdam, Netherlands",
  "start_date": "2026-07-15",
  "end_date": "2026-07-30"
}
* **Expected Result**: Code 201 Created.

### FAIL (Chronological contradiction)
{
  "user_id": 1,
  "title": "Time Travel Trip",
  "destination": "London, UK",
  "start_date": "2026-07-15",
  "end_date": "2026-07-10"
}
* **Expected Result**: Code 400 Bad Request | "The end date cannot be earlier than the start date."

## POST http://localhost:3000/api/flights

### SUCCESS (Outbound Flight)
{
  "trip_id": 1,
  "flight_number": "BA555",
  "airline": "British Airways",
  "departure_airport": "LHR",
  "arrival_airport": "FCO",
  "departure_datetime": "2026-07-10T08:00:00.000Z",
  "arrival_datetime": "2026-07-10T11:30:00.000Z",
  "direction": "outbound"
}
* **Expected Result**: Code 201 Created.

### SUCCESS (Return Flight)
{
  "trip_id": 1,
  "flight_number": "BA556",
  "airline": "British Airways",
  "departure_airport": "FCO",
  "arrival_airport": "LHR",
  "departure_datetime": "2026-07-17T16:20:00.000Z",
  "arrival_datetime": "2026-07-17T19:50:00.000Z",
  "direction": "return"
}
* **Expected Result**: Code 201 Created.

### FAIL (Arrival datetime earlier than departure)
{
  "trip_id": 1,
  "flight_number": "BA555",
  "airline": "British Airways",
  "departure_airport": "LHR",
  "arrival_airport": "FCO",
  "departure_datetime": "2026-07-10T15:00:00.000Z",
  "arrival_datetime": "2026-07-10T10:00:00.000Z",
  "direction": "outbound"
}
* **Expected Result**: Code 400 Bad Request | "Arrival datetime cannot be earlier than departure datetime."

### FAIL (Invalid / Missing Direction ENUM)
{
  "trip_id": 1,
  "flight_number": "BA555",
  "airline": "British Airways",
  "departure_airport": "LHR",
  "arrival_airport": "FCO",
  "departure_datetime": "2026-07-10T08:00:00.000Z",
  "arrival_datetime": "2026-07-10T11:30:00.000Z",
  "direction": "invalid_direction"
}
* **Expected Result**: Code 400 Bad Request | "The field direction must be either outbound or return."

### FAIL (Associated Trip Not Found - Error 1452)
{
  "trip_id": 999,
  "flight_number": "BA555",
  "airline": "British Airways",
  "departure_airport": "LHR",
  "arrival_airport": "FCO",
  "departure_datetime": "2026-07-10T08:00:00.000Z",
  "arrival_datetime": "2026-07-10T11:30:00.000Z",
  "direction": "outbound"
}
* **Expected Result**: Code 404 Not Found | "The associated trip was not found."

## POST http://localhost:3000/api/accommodations

### SUCCESS
{
  "name": "Selina Secret Garden",
  "address": "Praça da Ribeira 5",
  "city": "Porto",
  "country": "Portugal"
}
* **Expected Result**: Code 201 Created.

### FAIL (Duplicate Accommodation Error - uq_accommodation)
{
  "name": "Hotel Artemide",
  "address": "Via Nazionale 22",
  "city": "Rome",
  "country": "Italy"
}
* **Expected Result**: Code 409 Conflict | "This accommodation already exists in this city and country."

## POST http://localhost:3000/api/accommodations/reserve

### SUCCESS
{
  "accommodation_id": 1,
  "trip_id": 1,
  "check_in_date": "2026-07-10",
  "check_out_date": "2026-07-17",
  "check_in_time": "14:00:00",
  "check_out_time": "11:00:00"
}
* **Expected Result**: Code 201 Created.

### FAIL (Check-out date before Check-in date)
{
  "accommodation_id": 1,
  "trip_id": 1,
  "check_in_date": "2026-07-17",
  "check_out_date": "2026-07-10"
}
* **Expected Result**: Code 400 Bad Request | "Check-out date cannot be earlier than check-in date."

---

## PATCH http://localhost:3000/api/accommodations/reserve/:reserveId

### SUCCESS (Update Check-out Date Only)
* **Test URL**: http://localhost:3000/api/accommodations/reserve/1
* **Payload (JSON)**:
{
  "check_out_date": "2026-07-19"
}
* **Expected Result**: Code 200 OK.

### FAIL (Cross-Validation: New Check-out before existing Check-in)
* **Test URL**: http://localhost:3000/api/accommodations/reserve/1
* **Context**: The existing reservation starts on 2026-07-10. The user attempts to shorten the end date to before the start date.
* **Payload (JSON)**:
{
  "check_out_date": "2026-07-08"
}
* **Expected Result**: Code 400 Bad Request | "Check-out date cannot be earlier than check-in date."

### FAIL (Unique Reservation Constraint Violation)
* **Test URL**: http://localhost:3000/api/accommodations/reserve/2
* **Context**: Trying to change dates or IDs to values that conflict with an existing reservation (unique_reservation constraint).
* **Payload (JSON)**:
{
  "accommodation_id": 1,
  "trip_id": 1,
  "check_in_date": "2026-07-10",
  "check_out_date": "2026-07-17"
}
* **Expected Result**: Code 409 Conflict | "A reservation with these exact details already exists."

---

# DELETE (DATA REMOVAL)

## DELETE http://localhost:3000/api/flights/:flightId

### SUCCESS
* **Test URL**: http://localhost:3000/api/flights/10
* **Expected Result**: Code 200 OK containing the deleted flight object.

### FAIL (Flight Does Not Exist)
* **Test URL**: http://localhost:3000/api/flights/999
* **Expected Result**: Code 404 Not Found | "Flight not found."


## DELETE http://localhost:3000/api/trips/:tripId

### SUCCESS (SQL Cascade Effect)
* **Test URL**: http://localhost:3000/api/trips/10
* **Expected Result**: Code 200 OK containing the deleted trip object.
* **Cascade Effect**: Due to ON DELETE CASCADE, all associated flights and accommodation reservations for this trip are automatically removed.

### FAIL (Invalid Parameter Type in Middleware)
* **Test URL**: http://localhost:3000/api/trips/abc
* **Expected Result**: Code 400 Bad Request | "Invalid tripId." (Caught by validateIdParams middleware).


## DELETE http://localhost:3000/api/accommodations/reserve/:reserveId

### SUCCESS
* **Test URL**: http://localhost:3000/api/accommodations/reserve/10
* **Expected Result**: Code 200 OK containing the deleted reservation object. The accommodation itself remains intact.

### FAIL (Reservation Not Found)
* **Test URL**: http://localhost:3000/api/accommodations/reserve/999
* **Expected Result**: Code 404 Not Found | "Reservation not found."


## DELETE http://localhost:3000/api/accommodations/:accommodationId

### SUCCESS
* **Test URL**: http://localhost:3000/api/accommodations/2
* **Expected Result**: Code 200 OK containing the deleted accommodation object.
* **Cascade Effect**: Due to ON DELETE CASCADE on the database layer, all reservations (accommodation_reserve) linked to accommodation ID 2 are automatically deleted.
