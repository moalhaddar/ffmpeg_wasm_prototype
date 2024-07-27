#!/bin/bash -x

emcc -v

CFLAGS="-s USE_PTHREADS -O3"
LDFLAGS="$CFLAGS -s INITIAL_MEMORY=32M"
FLAGS=(
    --target-os=none
    --arch=x86_32
    --enable-cross-compile
    --disable-asm
    --disable-stripping
    --disable-programs
    --disable-doc
    --disable-debug
    --disable-runtime-cpudetect
    --disable-autodetect

    --extra-cflags="$CFLAGS"
    --extra-cxxflags="$CFLAGS"

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
