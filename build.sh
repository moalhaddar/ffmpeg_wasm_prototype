mkdir -p ffmpeg-wasm

em++ \
    -I./FFmpeg/ \
    -L./FFmpeg/libavcodec \
    -L./FFmpeg/libavdevice \
    -L./FFmpeg/libavfilter \
    -L./FFmpeg/libavformat \
    -L./FFmpeg/libavutil \
    -L./FFmpeg/libswresample \
    -L./FFmpeg/libswscale \
    -lavcodec  -lavdevice -lavfilter -lavformat -lavutil -lswresample -lswscale  \
    -lembind -lworkerfs.js \
    -sINITIAL_MEMORY=1024MB \
    -sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency \
    -sEXPORTED_RUNTIME_METHODS=FS \
    -sMODULARIZE -sEXPORT_NAME="createFFmpeg"\
    -O3 -sUSE_PTHREADS=1 \
    -o ./ffmpeg-wasm/ffmpeg.js \
    ./src/main.cpp