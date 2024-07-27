extern "C" {
    #include "libavformat/avformat.h"
}

#include <emscripten/bind.h>

emscripten::val init(const std::string inputPath) {
    emscripten::val result = emscripten::val::object();
    AVFormatContext* format_ctx = nullptr;
    if (avformat_open_input(&format_ctx, inputPath.c_str(), nullptr, nullptr) < 0) {
        result.set("exit", -1);
        return result;
    }

    if (avformat_find_stream_info(format_ctx, nullptr) < 0) {
        avformat_close_input(&format_ctx);
        result.set("exit", -1);
        return result;
    }

    
    result.set("format", format_ctx->iformat->name);
    result.set("duration", ((float)format_ctx->duration / (float)AV_TIME_BASE));
    result.set("nb_streams", format_ctx->nb_streams);

    emscripten::val streams = emscripten::val::array();
    for (unsigned int i = 0; i < format_ctx->nb_streams; i++) {
        AVStream *stream = format_ctx->streams[i];
        AVCodecParameters *codecpar = stream->codecpar;

        emscripten::val stream_info = emscripten::val::object();
        stream_info.set("index", i);
        stream_info.set("type", av_get_media_type_string(codecpar->codec_type));
        stream_info.set("codec", avcodec_get_name(codecpar->codec_id));

        emscripten::val metadata = emscripten::val::object();
        AVDictionaryEntry *tag = nullptr;
        while ((tag = av_dict_get(stream->metadata, "", tag, AV_DICT_IGNORE_SUFFIX))) {
            metadata.set(std::string(tag->key), std::string(tag->value));
        }


        stream_info.set("metadata", metadata);

        if (codecpar->codec_type == AVMEDIA_TYPE_VIDEO) {
            stream_info.set("width", codecpar->width);
            stream_info.set("height", codecpar->height);
            stream_info.set("fps", av_q2d(stream->avg_frame_rate));
        } else if (codecpar->codec_type == AVMEDIA_TYPE_AUDIO) {
            stream_info.set("sample_rate", codecpar->sample_rate);
            stream_info.set("channels", codecpar->channels);
        }

        streams.call<void>("push", stream_info);
    }

    result.set("streams", streams);
    result.set("exit", 0);
    avformat_close_input(&format_ctx);
    return result;
}

EMSCRIPTEN_BINDINGS(alhaddar) {
    emscripten::function("init", &init);
}