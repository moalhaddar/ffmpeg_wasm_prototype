mkdir -p wasm

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
    -sPTHREAD_POOL_SIZE=32 \
    -sEXPORTED_RUNTIME_METHODS=FS \
    -sMODULARIZE -sEXPORT_NAME="createFFmpeg"\
    -o ./wasm/binding.js \
    ./src/binding.cpp