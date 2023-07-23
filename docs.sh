#!/bin/bash

rm -rf ./docs/*.html ./docs/api/*

cp README.md docs/index.md

npx showdown makehtml -i ./docs/index.md -o ./docs/index.html
npx typedoc ./src

touch ./docs/.nojekyll
