#!/bin/bash -x

docker pull emscripten/emsdk:3.1.64
docker run \
  -v $PWD:/src \
  emscripten/emsdk:3.1.64 \
  sh -c 'bash ./build_ffmpeg.sh'