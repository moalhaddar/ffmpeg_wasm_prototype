#include <stdio.h>
#include <emscripten/bind.h>
#include <iostream>
extern "C" {
#include "libavcodec/avcodec.h"
#include "libavformat/avformat.h"
#include "libavutil/imgutils.h"
#include "libavutil/avutil.h"
#include "libswscale/swscale.h"
}

#include <emscripten/wasm_worker.h>

int init(const std::string inputPath) {
    AVFormatContext* format_ctx = nullptr;
    
    if (avformat_open_input(&format_ctx, inputPath.c_str(), nullptr, nullptr) < 0) {
        std::cerr << "Could not open input file: " << inputPath << std::endl;
        return 2;
    }

    // Retrieve stream information
    if (avformat_find_stream_info(format_ctx, nullptr) < 0) {
        std::cerr << "Could not find stream information" << std::endl;
        avformat_close_input(&format_ctx);
        return 3;
    }

    // Print format and stream information
    std::cout << "Format: " << format_ctx->iformat->name << std::endl;
    std::cout << "Duration: " << format_ctx->duration / AV_TIME_BASE << " seconds" << std::endl;
    std::cout << "Number of streams: " << format_ctx->nb_streams << std::endl;

    for (unsigned int i = 0; i < format_ctx->nb_streams; i++) {
        AVStream *stream = format_ctx->streams[i];
        AVCodecParameters *codecpar = stream->codecpar;

        std::cout << "\nStream #" << i << ":" << std::endl;
        std::cout << "  Type: " << av_get_media_type_string(codecpar->codec_type) << std::endl;
        std::cout << "  Codec: " << avcodec_get_name(codecpar->codec_id) << std::endl;

        if (codecpar->codec_type == AVMEDIA_TYPE_VIDEO) {
            std::cout << "  Resolution: " << codecpar->width << "x" << codecpar->height << std::endl;
            std::cout << "  FPS: " << av_q2d(stream->avg_frame_rate) << std::endl;
        } else if (codecpar->codec_type == AVMEDIA_TYPE_AUDIO) {
            std::cout << "  Sample rate: " << codecpar->sample_rate << " Hz" << std::endl;
            std::cout << "  Channels: " << codecpar->channels << std::endl;
        }
    }

    avformat_close_input(&format_ctx);
    return 0;
}

EMSCRIPTEN_BINDINGS(alhaddar) {
    emscripten::function("init", &init);
}
