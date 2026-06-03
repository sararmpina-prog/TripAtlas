# GET

GET http://localhost:3000/api/users
GET http://localhost:3000/api/flights
GET http://localhost:3000/api/trips

---

# POST

## POST http://localhost:3000/api/users

### SUCCESS

{
  "firstName": "Ana",
  "surname": "Campos",
  "email": "anacampos@email.com",
  "mobilePhone": "+351 912345678",
  "password": "supersecretpassword345"
}

Resultado esperado: Código 201 Created e os dados normalizados em camelCase

{
  "success": true,
  "data": {
    "id": 7,
    "firstName": "Ana",
    "surname": "Campos",
    "email": "anacampos@email.com",
    "mobilePhone": "+351 912345678",
    "createdAt": "2026-06-01 11:42:33",
    "updatedAt": "2026-06-01 11:42:33"
  }
}

### FAIL (número de telemóvel com texto)

{
  "firstName": "Rui",
  "surname": "Silva",
  "email": "ruisilva@email.com",
  "mobilePhone": "912-TEXTO-78",
  "password": "123"
}

Resultado esperado: 400 Bad Request com a mensagem customizada: "The field mobilePhone contains invalid characters.",

### FAIL (email mal formatado)

{
  "firstName": "Rui",
  "surname": "Silva",
  "email": "ruisila.com",
  "mobilePhone": "912345678",
  "password": "123"
}

Resultado esperado: 400 Bad Request com a mensagem customizada: "The field email must be a valid email address."


## POST http://localhost:3000/api/flights

### SUCCESS

{
  "tripId": 1,
  "flightNumber": "TAP555",
  "airline": "TAP Portugal",
  "departureAirport": "LIS",
  "arrivalAirport": "OPO",
  "departureDatetime": "2026-06-02T10:00:00.000Z",
  "arrivalDatetime": "2026-06-02T11:00:00.000Z"
}

Resultado esperado: Código 201 Created e os dados normalizados em camelCase

### SUCCESS

{
  "tripId": 12,
  "flightNumber": "EK194",
  "airline": "Emirates",
  "departureAirport": "LIS",
  "arrivalAirport": "DXB",
  "departureDatetime": "2026-08-01T14:00:00.000Z",
  "arrivalDatetime": "2026-08-02T01:00:00.000Z"
}

Resultado esperado: Código 201 Created e os dados normalizados em camelCase

### FAIL (data de chegada antes da data de partida)

{
  "tripId": 1,
  "departureDatetime": "2026-06-02T15:00:00.000Z",
  "arrivalDatetime": "2026-06-02T10:00:00.000Z"
}

Resultado esperado: Código 400 Bad Request com a mensagem customizada: "Arrival datetime cannot be earlier than departure datetime."

### FAIL (id de trip inválido)

{
  "tripId": 999,
  "departureDatetime": "2026-06-02T10:00:00.000Z",
  "arrivalDatetime": "2026-06-02T11:00:00.000Z"
}

Resultado esperado: 404 Not Found com a mensagem customizada: "The associated trip was not found."

## POST http://localhost:3000/api/trips

### SUCCESS

{
  "userId": 1,
  "title": "Eurotrip Verão 2026",
  "description": "Backpacking pela Europa central com amigos da faculdade.",
  "destination": "Amsterdão, Países Baixos",
  "startDate": "2026-07-15",
  "endDate": "2026-07-30"
}

Resultado esperado: Código 201 Created e os dados normalizados em camelCase

### FAIL (data de chegada antes da data de partida)

{
  "userId": 1,
  "title": "Viagem no Tempo",
  "destination": "Porto",
  "startDate": "2026-07-15",
  "endDate": "2026-07-10"
}

Resultado esperado:  Código 400 Bad Request com a mensagem customizada: "The end date cannot be earlier than the start date."

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
  "startDate": "2026-08-01",
  "endDate": "2026-08-15"
}
* **Resultado Esperado**: Código 200 OK

### FAIL (Validação Parcial contra a Base de Dados)

* **URL de Teste**: http://localhost:3000/api/trips/1
* **Contexto**: Data de fim anterior à data de início.
* **Payload (JSON)**:
{
  "endDate": "2026-05-20"
}
* **Resultado Esperado**: Código 400 Bad Request com a mensagem customizada: "The end date cannot be earlier than the start date."

### FAIL (Viagem Não Encontrada)
* **URL de Teste**: http://localhost:3000/api/trips/999
* **Payload (JSON)**:
{
  "title": "Qualquer Título"
}
* **Resultado Esperado**: Código 404 Not Found com a mensagem customizada: "Trip not found."

---

## PATCH http://localhost:3000/api/flights/:flightId

### SUCCESS (Alterar Apenas o Número do Voo)
* **URL de Teste**: http://localhost:3000/api/flights/1
* **Payload (JSON)**:
{
  "flightNumber": "TAP000"
}
* **Resultado Esperado**: Código 200 OK.

### FAIL (Quebra Cronológica com Data Existente)
* **URL de Teste**: http://localhost:3000/api/flights/1
* **Contexto**: Data de partida alterada para depois da hora de chegada que já estava gravada.
* **Payload (JSON)**:
{
  "departureDatetime": "2026-06-01T15:00:00.000Z"
}
* **Resultado Esperado**: Código 400 Bad Request com a mensagem: "Arrival datetime cannot be earlier than departure datetime."

---

# DELETE 

## DELETE http://localhost:3000/api/flights/:flightId

### SUCCESS
* **URL de Teste**: http://localhost:3000/api/flights/10
* **Resultado Esperado**: Código 200 OK com o objeto do voo que acabou de ser eliminado normalizado em camelCase.

### FAIL (Voo Não Existe)
* **URL de Teste**: http://localhost:3000/api/flights/999
* **Resultado Esperado**: Código 404 Not Found com a mensagem customizada: "Flight not found."

---

## DELETE http://localhost:3000/api/trips/:tripId

### SUCCESS (Efeito Cascata no SQL)
* **URL de Teste**: http://localhost:3000/api/trips/11
* **Resultado Esperado**: Código 200 OK com a viagem eliminada.

### FAIL (Parâmetro Inválido no Middleware)
* **URL de Teste**: http://localhost:3000/api/trips/abc
* **Resultado Esperado**: Código 400 Bad Request com a mensagem do nosso middleware validateIdParams: "Invalid tripId." (Apanhado na fronteira sem sequer tocar no Service ou na BD!).

## Demonstração do ON DELETE CASCADE (Viagem ID 5)

### 1. Estado Inicial (Antes de Apagar)
* Executa um `GET http://localhost:3000/api/flights`.
* **O que vais ver**: Vais encontrar o voo associado à viagem ID 12: `EK194` da Emirates.

### 2. A Execução do Delete
* Executa o pedido: `DELETE http://localhost:3000/api/trips/12`
* **Resultado**: A viagem "Backpacking pela Europa central com amigos da faculdade." é eliminada do sistema.

### 3. O Estado Final (Efeito Cascata Duplo)
* Executa novamente o `GET http://localhost:3000/api/flights`.
* **O que vais ver**: Tanto o voo `LH654` como o voo `EK194` **desapareceram por completo e em simultâneo** da base de dados.
