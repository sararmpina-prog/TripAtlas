# atualizar main local
git checkout main
git pull origin main

# atualizar a minha branch
git checkout Leonor
git merge main

# resolver conflitos
git add .
git commit

# enviar a minha branch
git push origin Leonor

# criar Pull Request no GitHub
Leonor -> main

# Só depois de rever o PR:
GitHub
→ Merge Pull Request

## Dica extra

Quando estiver a resolver conflitos grandes, evitar:

`git add .`

até teres a certeza de que todos os conflitos estão resolvidos.

É preferível:

`git status`

e verificar se ainda existe algum ficheiro em Unmerged paths antes de adicionar tudo.
Isso evita commits com conflitos mal resolvidos.