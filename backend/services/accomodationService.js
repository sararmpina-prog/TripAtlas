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



// ATUALIZA UMA ESTADIA EXISTENTE (PUT OU PATCH)
// Os dados de formato chegam validados, mas tratamos a regra cronológica de negócio aqui
export async function updateAccommodation(id, validatedAccommodation) {

  //Se estadia existe 
  console.log("Service patch estadia id", id)
  const existingAccommodation = await accommodationRepository.findAccommodationById(id);

  if (!existingAccommodation) {
    throw new NotFoundError('Accommodation not found.');
  }

  let updateData = {};

  updateData = {
  name: validatedAccommodation.name ?? existingAccommodation.name,
  city: validatedAccommodation.city ?? existingAccommodation.city,
  country: validatedAccommodation.country ?? existingAccommodation.country,
};
  
  console.log("serviço validatedEstadia", updateData)

  await accommodationRepository.updateAccommodation(id, updateData);

  const updateAccommodation = await accommodationRepository.findAccommodationById(id);

  return updateAccommodation

}