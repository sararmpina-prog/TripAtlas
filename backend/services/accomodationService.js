import * as accommodationRepository from '../repository/accommodationRepository.js';
import { NotFoundError, ValidationError} from '../utils/appErrors.js';


// LISTA TODAS AS ESTADIAS
export async function listAccomodations() {
  
  const accommodations = await accommodationRepository.listAccomodations();

  return accommodations;
}


// APAGA UMA ESTADIA EXISTENTE
export async function deleteAccommodation(id) {

  const accommodation = await accommodationRepository.findAccommodationById(id)

  if (!accommodation) {
    throw new NotFoundError('Accommodation not found');
  }

   // Apaga a reserva diretamente da base de dados
  await accommodationRepository.deleteAccommodation(accommodation.id);

  return accommodation; 
}


// CRIA UMA NOVA ESTADIA
export async function createAccommodation(payload) {

  console.log("Estou no serviço estadias")

  const accommodation = payload

  console.log("A reserva é, após validações da data", accommodation)

  const duplicatedAccommodation = await accommodationRepository.listDuplicatedAccommodation(accommodation)

 if (duplicatedAccommodation) {
    throw new ValidationError('Accommodation already exists');
  }

 let newAccommodation = await accommodationRepository.createAccommodation(accommodation)

 let createAccommodation = await accommodationRepository.findAccommodationById(newAccommodation)

  return createAccommodation
}