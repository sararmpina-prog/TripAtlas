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