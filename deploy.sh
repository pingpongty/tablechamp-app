#!/bin/bash
FULL_REPO="git@github.com:Unicity/jade.git"


# setup REPO and checkout gh-pages branch

# do useful work for gh-pages, for example convert README.md to index.html
ls node_modules
npm run build
if [[ $? -ne 0 ]] ; then
	exit 1
fi
cd build

git init
git remote add origin $FULL_REPO
git fetch
git config user.name "Unicity-Github-Bot"
git config user.email "clay.murray@unicity.com"
git checkout -B gh-pages


# commit and push changes
git add -f .
git commit -m "GH-Pages update by travis after $TRAVIS_COMMIT"
git push -f origin gh-pages
