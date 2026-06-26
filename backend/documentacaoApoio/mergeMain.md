git fetch origin

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