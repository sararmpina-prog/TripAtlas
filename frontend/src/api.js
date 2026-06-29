// Este ficheiro centraliza e reexporta todas as funções da pasta API, organizando-as por domínio (auth, trips, flights, etc.). Isso facilita a manutenção e a escalabilidade do código, permitindo que outras partes da aplicação importem apenas do 'api' sem se preocupar com a estrutura interna dos módulos.
export * from './api/client';
export * from './api/auth';
export * from './api/trips';
export * from './api/flights';
export * from './api/reserves';
export * from './api/chat';
export * from './api/journal';
export * from './api/users';