__filename = "ffmpeg.js"
importScripts("ffmpeg.js");

let ffmpegModule;

createFFmpeg({
    noInitialRun: true,
    locateFile: (path) => {
        return path;
    },
    print: (str) => {
        console.log(str);
        self.postMessage({
            type: "stdout",
            payload: `[WASM] ${str}\n`,
        });
    },
})
    .then((lib) => {
        ffmpegModule = lib;
        self.postMessage({
            type: "stdout",
            payload: "\n[JS] Loaded\n",
        });
        self.postMessage({
            type: "loaded",
            payload: true,
        });
    })
    .catch(console.log);

self.onmessage = (msg) => {
    if (msg.data.type === "process") {
        const { payload: file } = msg.data;
        const mountPoint = '/root'

        if (!ffmpegModule.FS.analyzePath(mountPoint).exists) {
            ffmpegModule.FS.mkdir(mountPoint);
        }
        ffmpegModule.FS.mount(ffmpegModule.FS.filesystems.WORKERFS, {
            blobs: [file]
        }, mountPoint);

        const filePath = `${mountPoint}/` + file.name;
        const begin = performance.now()
        const result = ffmpegModule.init(filePath)
        const end = performance.now();
        console.log(`init() exited with code ${result.exit}. Time: ${end - begin}ms`);
        self.postMessage({
            type: "processResponse",
            payload: JSON.stringify(result, undefined, 4),
        });
        ffmpegModule.FS.unmount(mountPoint)
    }

    if (msg.data.type === 'upload') {
        const { payload: file } = msg.data;
        const mountPoint = '/root'

        if (!ffmpegModule.FS.analyzePath(mountPoint).exists) {
            ffmpegModule.FS.mkdir(mountPoint);
        }
        ffmpegModule.FS.mount(ffmpegModule.FS.filesystems.WORKERFS, {
            blobs: [file]
        }, mountPoint);
    }

    if (msg.data.type === "cmd") {
        const ffmpeg = ffmpegModule.cwrap("main", "number", ["number", "number"])
        const { args } = msg.data;
        // Allocate memory for the array of pointers
        const argvPointer = ffmpegModule._malloc(args.length * 4);

        // Allocate memory for each string and set the pointer
        for (let i = 0; i < args.length; i++) {
            const strPointer = ffmpegModule.stringToNewUTF8(args[i]);
            ffmpegModule.setValue(argvPointer + i * 4, strPointer, "i32");
        }

        const timer = setInterval(() => {
            console.log(ffmpegModule.FS.readdir('/'))
            const logFileName = ffmpegModule.FS.readdir('/').find(name => name.endsWith('.log'));
            if (typeof logFileName !== 'undefined') {
                const log = String.fromCharCode.apply(null, ffmpegModule.FS.readFile(logFileName));
                if (log.includes("frames successfully decoded")) {
                    clearInterval(timer);
                    const output = ffmpegModule.FS.readFile('output.flac');
                    const blob = new Blob([output], { type: 'application/octet-stream' }); 
                    const url = URL.createObjectURL(blob);
                    self.postMessage({ type: "download", payload: url });
                }
            }
        }, 500);

        ffmpeg(args.length, argvPointer) // this blocks
        console.log("done")
    }
};