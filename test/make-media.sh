#!/bin/bash
# Creates the sample files test/e2e.mjs uses. Works on macOS, Windows (Git Bash) and Linux.
set -e
cd "$(dirname "$0")" && mkdir -p media && cd media
FF=$(node -p "require('../../node_modules/ffmpeg-static')")
"$FF" -hide_banner -loglevel error -y -f lavfi -i testsrc2=size=1920x1080:rate=30 -f lavfi -i sine=frequency=440:sample_rate=48000 -t 40 -c:v libx264 -preset ultrafast -crf 8 -c:a aac -b:a 256k -pix_fmt yuv420p clip.mp4
"$FF" -hide_banner -loglevel error -y -f lavfi -i testsrc2=size=1280x720:rate=60 -t 6 -c:v libx264 -preset ultrafast -crf 20 short.mov
"$FF" -hide_banner -loglevel error -y -f lavfi -i "color=c=red@0.0:s=600x400,format=rgba,drawbox=x=100:y=100:w=200:h=150:c=blue@1:t=fill" -frames:v 1 alpha.png
"$FF" -hide_banner -loglevel error -y -f lavfi -i testsrc2=size=4032x3024 -frames:v 1 -q:v 2 photo.jpg
cp ../fixtures/iphone.heic iphone.heic
"$FF" -hide_banner -loglevel error -y -f lavfi -i "sine=frequency=330:duration=30" -af "volume=0.05" -c:a libmp3lame -b:a 320k song.mp3
cd .. && node makepdf.mjs
echo "Test media ready in test/media"
