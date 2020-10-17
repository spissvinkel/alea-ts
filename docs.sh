#!/bin/bash

rm -rf ./docs/*.html ./docs/api/*

npx showdown makehtml -i ./docs/index.md -o ./docs/index.html
npx typedoc ./src

touch ./docs/.nojekyll
