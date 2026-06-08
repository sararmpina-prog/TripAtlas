# REGISTO

## POST http://localhost:3000/api/register

### SUCCESS

{
  "first_name": "Carlos",
  "surname": "Antunes",
  "email": "carlos@email.com",
  "mobile_phone": "+351 919999999",
  "password": "passsecreta123"
}

* **Resultado Esperado**: Código 201 Created. A API vai devolver um objeto contendo o token gerado pelo JWT e os dados do utilizador sem a password.

### SUCCESS

{
  "first_name": "Ana",
  "surname": "Ramos",
  "email": "anaramos@email.com",
  "mobile_phone": null,
  "password": "registo_2"
}

* **Resultado Esperado**: Código 201 Created. A API vai devolver um objeto contendo o token gerado pelo JWT e os dados do utilizador sem a password.


# LOGIN

## POST http://localhost:3000/api/login

{
  "email": "carlos@email.com",
  "password": "passsecreta123"
}

* **Resultado Esperado**:  Código 200 OK com o JSON contendo o token.

---
## POST http://localhost:3000/api/login

{
  "email": "anaramos@email.com",
  "password": "registo_2"
}

* **Resultado Esperado**:  Código 200 OK com o JSON contendo o token.

# Como testar as rotas protegidas:

Como a barreira global foi activada no app.js, se tentarmos fazer:

GET http://localhost:3000/api/trips, vamos ter `erro 401 Unauthorized`

Para conseguirmos ver as viagens no Thunder Client:

Copiar o texto do token que recebemos no sucesso do Login.

No pedido das trips, clicamos na aba Headers do Thunder Client.Adicionamos um header chamado `Authorization`.

No valor, escrevemos `Bearer`  seguido do token colado
(exemplo: Bearer eyJhbGciOi...).
Clicamos em Send e a rota vai abrir com sucesso.

---

# GET

GET http://localhost:3000/api/users
GET http://localhost:3000/api/flights
GET http://localhost:3000/api/trips
GET http://localhost:3000/api/accommodations
GET http://localhost:3000/api/accommodations/reserve

---

# POST

## POST http://localhost:3000/api/users

### SUCCESS

{
  "first_name": "Ana",
  "surname": "Campos",
  "email": "anacampos@email.com",
  "mobile_phone": "+351 912345678",
  "password": "supersecretpassword345"
}

* **Resultado Esperado**: Código 201 Created

{
  "success": true,
  "data": {
    "id": 7,
    "first_name": "Ana",
    "surname": "Campos",
    "email": "anacampos@email.com",
    "mobile_phone": "+351 912345678",
    "createdAt": "2026-06-01 11:42:33",
    "updatedAt": "2026-06-01 11:42:33"
  }
}

### FAIL (número de telemóvel com texto)

{
  "first_name": "Rui",
  "surname": "Silva",
  "email": "ruisilva@email.com",
  "mobile_phone": "912-TEXTO-78",
  "password": "123"
}

* **Resultado Esperado**: 400 Bad Request com a mensagem customizada: "The field mobile_phone contains invalid characters.",

### FAIL (email mal formatado)

{
  "first_name": "Rui",
  "surname": "Silva",
  "email": "ruisila.com",
  "mobile_phone": "912345678",
  "password": "123"
}

* **Resultado Esperado**: 400 Bad Request com a mensagem customizada: "The field email must be a valid email address."


## POST http://localhost:3000/api/flights

### SUCCESS

{
  "trip_id": 1,
  "flight_number": "TAP555",
  "airline": "TAP Portugal",
  "departure_airport": "LIS",
  "arrival_airport": "OPO",
  "departure_datetime": "2026-06-02T10:00:00.000Z",
  "arrival_datetime": "2026-06-02T11:00:00.000Z"
}

* **Resultado Esperado**: Código 201 Created

### SUCCESS

{
  "trip_id": 12,
  "flight_number": "EK194",
  "airline": "Emirates",
  "departure_airport": "LIS",
  "arrival_airport": "DXB",
  "departure_datetime": "2026-08-01T14:00:00.000Z",
  "arrival_datetime": "2026-08-02T01:00:00.000Z"
}

* **Resultado Esperado**: Código 201 Created

### FAIL (data de chegada antes da data de partida)

{
  "trip_id": 1,
  "departure_datetime": "2026-06-02T15:00:00.000Z",
  "arrival_datetime": "2026-06-02T10:00:00.000Z"
}

* **Resultado Esperado**: Código 400 Bad Request com a mensagem customizada: "Arrival datetime cannot be earlier than departure datetime."

### FAIL (id de trip inválido)

{
  "trip_id": 999,
  "departure_datetime": "2026-06-02T10:00:00.000Z",
  "arrival_datetime": "2026-06-02T11:00:00.000Z"
}

* **Resultado Esperado**: 404 Not Found com a mensagem customizada: "The associated trip was not found."

## POST http://localhost:3000/api/trips

### SUCCESS

{
  "user_id": 1,
  "title": "Eurotrip Verão 2026",
  "description": "Backpacking pela Europa central com amigos da faculdade.",
  "destination": "Amsterdão, Países Baixos",
  "start_date": "2026-07-15",
  "end_date": "2026-07-30"
}

* **Resultado Esperado**: Código 201 Created

### FAIL (data de chegada antes da data de partida)

{
  "user_id": 1,
  "title": "Viagem no Tempo",
  "destination": "Porto",
  "start_date": "2026-07-15",
  "end_date": "2026-07-10"
}

* **Resultado Esperado**:  Código 400 Bad Request com a mensagem customizada: "The end date cannot be earlier than the start date."


## POST http://localhost:3000/api/accommodations

### SUCCESS

{
  "name": "Selina Secret Garden",
  "city": "Lisboa",
  "country": "Portugal"
}

* **Resultado Esperado**: Código 201 Created

### FAIL (Duplicação do índice UNIQUE)

{
  "name": "Hotel Lisboa Plaza",
  "city": "Lisboa",
  "country": "Portugal"
}

* **Resultado Esperado**: 409 Conflict | "This accommodation already exists in this city and country."


## POST http://localhost:3000/api/accommodations/reserve

### SUCCESS

{
  "accommodation_id": 4,
  "trip_id": 1,
  "check_in_date": "2026-06-01",
  "check_out_date": "2026-06-05"
}

* **Resultado Esperado**: Código 201 Created

### FAIL (Check-out anterior ao Check-in)

{
  "accommodation_id": 4,
  "trip_id": 1,
  "check_in_date": "2026-06-05",
  "check_out_date": "2026-06-01"
}

* **Resultado Esperado**: 400 Bad Request | "Check-out date cannot be earlier than check-in date."

---

# PATCH (Atualização Parcial)

## PATCH http://localhost:3000/api/trips/:tripId

### SUCCESS (Atualizar Apenas um Campo)

* **URL de Teste**: http://localhost:3000/api/trips/1
* **Payload (JSON)**:
{
  "title": "Nova Eurotrip Alterada"
}
* **Resultado Esperado**: Código 200 OK

### SUCCESS (Atualizar Datas Cruzadas Válidas)

* **URL de Teste**: http://localhost:3000/api/trips/1
* **Payload (JSON)**:
{
  "start_date": "2026-08-01",
  "end_date": "2026-08-15"
}
* **Resultado Esperado**: Código 200 OK

### FAIL (Validação Parcial contra a Base de Dados)

* **URL de Teste**: http://localhost:3000/api/trips/1
* **Contexto**: Data de fim anterior à data de início.
* **Payload (JSON)**:
{
  "end_date": "2026-05-20"
}
* **Resultado Esperado**: Código 400 Bad Request com a mensagem customizada: "The end date cannot be earlier than the start date."

### FAIL (Viagem Não Encontrada)
* **URL de Teste**: http://localhost:3000/api/trips/999
* **Payload (JSON)**:
{
  "title": "Qualquer Título"
}
* **Resultado Esperado**: Código 404 Not Found com a mensagem customizada: "Trip not found."


## PATCH http://localhost:3000/api/flights/:flightId

### SUCCESS (Alterar Apenas o Número do Voo)
* **URL de Teste**: http://localhost:3000/api/flights/1
* **Payload (JSON)**:
{
  "flight_number": "TAP000"
}
* **Resultado Esperado**: Código 200 OK.

### FAIL (Quebra Cronológica com Data Existente)
* **URL de Teste**: http://localhost:3000/api/flights/1
* **Contexto**: Data de partida alterada para depois da hora de chegada que já estava gravada.
* **Payload (JSON)**:
{
  "departure_datetime": "2026-06-01T15:00:00.000Z"
}
* **Resultado Esperado**: Código 400 Bad Request com a mensagem: "Arrival datetime cannot be earlier than departure datetime."


## PATCH http://localhost:3000/api/accommodations/:accommodationId

### SUCCESS (Atualizar Nome do Hotel)
* **URL de Teste**: http://localhost:3000/api/accommodations/1
* **Payload (JSON)**:
{
  "name": "Hotel Lisboa Plaza Premium"
}
* **Resultado Esperado**: Código 200 OK.

### FAIL (Violação do Índice Único com Registo Existente)
* **URL de Teste**: http://localhost:3000/api/accommodations/1
* **Contexto**: Tentar alterar o nome/localização para dados idênticos aos de outro hotel já registado.
* **Payload (JSON)**:
{
  "name": "Pestana CR7",
  "city": "Funchal",
  "country": "Portugal"
}
* **Resultado Esperado**: Código 409 Conflict | "This accommodation already exists in this city and country."


## PATCH http://localhost:3000/api/accommodations/reserve/:reserveId

### SUCCESS (Alterar Apenas Data de Check-out)
* **URL de Teste**: http://localhost:3000/api/accommodations/reserve/1
* **Payload (JSON)**:
{
  "check_out_date": "2026-12-26"
}
* **Resultado Esperado**: Código 200 OK.

### FAIL (Validação Cruzada: Novo Check-out anterior ao Check-in atual)
* **URL de Teste**: http://localhost:3000/api/accommodations/reserve/1
* **Contexto**: A reserva atual começa a 2026-12-20. O utilizador tenta encurtar o fim para antes do início.
* **Payload (JSON)**:
{
  "check_out_date": "2026-12-18"
}
* **Resultado Esperado**: Código 400 Bad Request | "Check-out date cannot be earlier than check-in date."

### FAIL (Violação de Reserva Única Replicada)
* **URL de Teste**: http://localhost:3000/api/accommodations/reserve/2
* **Contexto**: Tentar mudar as datas ou IDs para valores que colidam exatamente com outra reserva existente (restrição unique_reservation).
* **Payload (JSON)**:
{
  "accommodation_id": 4,
  "trip_id": 1,
  "check_in_date": "2026-06-01",
  "check_out_date": "2026-06-05"
}
* **Resultado Esperado**: Código 409 Conflict | "A reservation with these exact details already exists."

---

# DELETE 

## DELETE http://localhost:3000/api/flights/:flightId

### SUCCESS
* **URL de Teste**: http://localhost:3000/api/flights/10
* **Resultado Esperado**: Código 200 OK com o objeto do voo que acabou de ser eliminado.

### FAIL (Voo Não Existe)
* **URL de Teste**: http://localhost:3000/api/flights/999
* **Resultado Esperado**: Código 404 Not Found com a mensagem customizada: "Flight not found."


## DELETE http://localhost:3000/api/trips/:tripId

### SUCCESS (Efeito Cascata no SQL)
* **URL de Teste**: http://localhost:3000/api/trips/11
* **Resultado Esperado**: Código 200 OK com a viagem eliminada.

### FAIL (Parâmetro Inválido no Middleware)
* **URL de Teste**: http://localhost:3000/api/trips/abc
* **Resultado Esperado**: Código 400 Bad Request com a mensagem do middleware: "Invalid tripId." (Apanhado na fronteira pelo validateIdParams).


## DELETE http://localhost:3000/api/accommodations/reserve/:reserveId

### SUCCESS
* **URL de Teste**: http://localhost:3000/api/accommodations/reserve/10
* **Resultado Esperado**: Código 200 OK com o objeto da reserva eliminado. O hotel em si não é apagado.

### FAIL (Reserva Não Encontrada)
* **URL de Teste**: http://localhost:3000/api/accommodations/reserve/999
* **Resultado Esperado**: Código 404 Not Found | "Reservation not found."


## DELETE http://localhost:3000/api/accommodations/:accommodationId

### SUCCESS
* **URL de Teste**: http://localhost:3000/api/accommodations/2
* **Resultado Esperado**: Código 200 OK com o hotel eliminado.
* **Efeito Cascata**: Devido ao ON DELETE CASCADE definido na base de dados, todas as reservas (accommodation_reserve) associadas a este hotel com ID 2 são eliminadas automaticamente.
