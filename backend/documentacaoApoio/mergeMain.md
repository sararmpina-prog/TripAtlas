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

git checkout Leonor
git merge main

# resolver conflitos, se existirem

git add .
git commit

git push origin Leonor


## Parte final:

git checkout main
git pull origin main
git merge Leonor
git push origin main