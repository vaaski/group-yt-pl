#!/usr/bin/env zsh

dir="${0%/*}"
npm run start --prefix $dir
read -s -k '?Press any key to continue.'
