import * as accommodationRepository from '../repository/accommodationRepository.js';


// LISTA TODAS AS ESTADIAS
export async function listAccomodations() {
  
  const accommodations = await accommodationRepository.listAccomodations();

  return accommodations;
}


// APAGA UMA ESTADIA EXISTENTE
export async function deleteAccommodation(id) {

  const accommodation = await reserveRepository.findAccommodationById(id)

  if (!accommodation) {
    throw new NotFoundError('Accommodation not found');
  }

   // Apaga a reserva diretamente da base de dados
  await accommodationRepository.deleteAccommodation(accommodation.id);

  return accommodation; 
}