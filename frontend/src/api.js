// Este ficheiro centraliza e reexporta todas as funções da pasta API, organizando-as por domínio (auth, trips, logistics, etc.). Isso facilita a manutenção e a escalabilidade do código, permitindo que outras partes da aplicação importem apenas do 'api' sem se preocupar com a estrutura interna dos módulos.
export * from './api/client';
export * from './api/auth';
export * from './api/trips';
export * from './api/logistics';
export * from './api/chat';
