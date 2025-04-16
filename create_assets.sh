#!/bin/bash
mkdir -p public/assets
convert -size 40x40 xc:transparent -fill white -draw "circle 20,20 20,10" public/assets/player.png
convert -size 150x20 xc:gray public/assets/platform.png
convert -size 20x20 xc:transparent -fill yellow -draw "circle 10,10 10,5" public/assets/artifact.png
convert -size 40x40 xc:transparent -fill black -draw "rectangle 0,0 40,40" public/assets/shadow.png
convert -size 800x600 xc:darkgray public/assets/background.jpg
convert -size 32x32 xc:transparent -fill white -draw "polygon 10,16 22,8 22,24" public/assets/left-arrow.png
convert -size 32x32 xc:transparent -fill white -draw "polygon 22,16 10,8 10,24" public/assets/right-arrow.png
convert -size 32x32 xc:transparent -fill white -draw "polygon 16,10 8,22 24,22" public/assets/jump-arrow.png