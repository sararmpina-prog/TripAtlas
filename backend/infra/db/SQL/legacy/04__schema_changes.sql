/*  ******* EXEMPLOS ******* */

ALTER TABLE tarefas
DROP COLUMN id_utilizador;
ALTER TABLE tarefas
ADD COLUMN id_estado INT;

ALTER TABLE tarefas
ADD CONSTRAINT fk_tarefa_estado
FOREIGN KEY (id_estado)
REFERENCES estados(id);

ALTER TABLE tarefas DROP COLUMN estado;

-- SET sql_safe_updates = 0; -- desligar o safemode