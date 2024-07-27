mkdir -p ffmpeg-wasm

emcc \
    -I./FFmpeg/ -I./FFmpeg/fftools \
    -L./FFmpeg/libavcodec \
    -L./FFmpeg/libavdevice \
    -L./FFmpeg/libavfilter \
    -L./FFmpeg/libavformat \
    -L./FFmpeg/libavutil \
    -L./FFmpeg/libswresample \
    -L./FFmpeg/libpostproc \
    -L./FFmpeg/libswscale \
    -L./FFmpeg/libswresample \
    -lavcodec  -lavdevice -lavfilter -lavformat -lavutil -lswresample -lswscale  \
    -lembind -lworkerfs.js \
    -sINITIAL_MEMORY=1024MB \
    -sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency \
    -sEXPORTED_RUNTIME_METHODS="[FS, cwrap, ccall, setValue, stringToNewUTF8]" \
    -sEXPORTED_FUNCTIONS=_main,_malloc \
    -sMODULARIZE -sEXPORT_NAME="createFFmpeg" \
    -sINVOKE_RUN=0 \
    -s USE_SDL=2 \
    -O3 -sUSE_PTHREADS=1 -Qunused-arguments \
    -o ./ffmpeg-wasm/ffmpeg.js \
    ./src/main.cpp \
    ./FFmpeg/fftools/ffmpeg_opt.c \
    ./FFmpeg/fftools/ffmpeg_filter.c \
    ./FFmpeg/fftools/ffmpeg_hw.c \
    ./FFmpeg/fftools/cmdutils.c \
    ./FFmpeg/fftools/ffmpeg.c

cp -r ffmpeg-wasm ~/programming/alhaddar-dev/src/lib