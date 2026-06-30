# CHERRY-PICK:

- git log --oneline -n 1

Copiar o código de 7 caracteres (letras e números) que aparece no início da linha (ex: a1b2c3d).

- git checkout main
- git pull origin main

- git cherry-pick <CÓDIGO_DO_COMMIT>

em caso de serem ficheiros com muitas mexidas o Git pode pedir para confirmar a junção:

- it add frontend/src/Dashboard.jsx
- git cherry-pick --continue

- git push origin main

-----

# atualizar main local
git checkout main
git pull origin main

# atualizar a minha branch
git checkout Leonor
git merge main

# resolver conflitos

git status
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