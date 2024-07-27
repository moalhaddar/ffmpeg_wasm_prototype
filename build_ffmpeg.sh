#!/bin/bash -x

emcc -v

FLAGS=(
    --target-os=none
    --arch=x86_32
    --enable-cross-compile
    --disable-asm                 # disable asm
    --disable-stripping           # disable stripping as it won't work
    --disable-programs            # disable ffmpeg, ffprobe and ffplay build
    --disable-doc                 # disable doc build
    --disable-debug               # disable debug mode
    --disable-runtime-cpudetect   # disable cpu detection
    --disable-autodetect          # disable env auto detect

    --nm=emnm
    --ar=emar
    --ranlib=emranlib
    --cc=emcc
    --cxx=em++
    --objcc=emcc
    --dep-cc=emcc
)

cd FFmpeg
emconfigure ./configure "${FLAGS[@]}"
make -B -j
