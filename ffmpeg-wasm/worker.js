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
        const {payload: file} = msg.data;
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
        console.log(`init() exited with code ${result.exit}. Time: ${end-begin}ms`);
        console.log(result);
        ffmpegModule.FS.unmount(mountPoint)
    }
};