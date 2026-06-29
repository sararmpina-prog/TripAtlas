#  O que é o Auto-Healing Schema? (A Definição Simples)

É um mecanismo arquitetural em Node.js que garante que a aplicação valida e corrige a estrutura da base de dados automaticamente em tempo de execução (runtime) sempre que o servidor é iniciado.

# Como funciona neste código? (O Passo a Passo)
Quando executam o comando npm start, o ficheiro server.js segue esta sequência antes de abrir a API ao público:

1. **Teste de Pulsação:** Executa um SELECT 1 para garantir que o MySQL está ligado e a responder (checkDBConnection).

2. **Invocação do Auto-Healing:** Chama a função ensureTripAtlasSchema() que está no db.js.

3. **Criação de Tabelas:** O código percorre o array tableStatements e executa o comando CREATE TABLE IF NOT EXISTS para cada tabela. Se a tabela já existir, o MySQL ignora; se não existir (ou tiver sido apagada), o Node cria-a no momento.

4. **Injeção de Chaves Estrangeiras Inteligente:** Para evitar erros de duplicação, o método ensureForeignKey faz uma consulta ao information_schema do MySQL para verificar se a restrição (ex: fk_trips_user) já existe. Se não existir, ele injeta o ALTER TABLE automaticamente com as regras de ON DELETE CASCADE.


## Quais são as Vantagens?
1. **Configuração Zero (Zero-Configuration Deployment):** Se um novo colega de equipa ou o professor descarregar o código do GitHub, ele não precisa de importar um ficheiro .sql manualmente. Basta criar uma base de dados vazia, ligar o servidor, e o Node constrói o ecossistema inteiro sozinho de forma idêntica.

2. **Resiliência e Recuperação de Desastres:** Se por acidente alguém apagar uma tabela de ligação a meio do desenvolvimento, basta reiniciar o servidor. A aplicação deteta a ausência e regenera a tabela em falta instantaneamente.

3. **Sincronização com as Camadas Superiores:** Garante que o código JavaScript e a vossa Base de Dados estão sempre em sintonia com as mesmas restrições e colunas, evitando erros misteriosos de runtime.

### Nota: Esta implementação garante um deploy imediato com configuração zero, embora tenhamos consciência de que, para um ambiente de produção em larga escala, o trade-off seria evoluir isto para um sistema de versionamento formal de migrations (ainda não estudámos).