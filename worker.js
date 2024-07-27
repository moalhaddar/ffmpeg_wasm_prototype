importScripts("wasm/binding.js");

let ffmpegModule;

createFFmpeg({
    noInitialRun: true,
    locateFile: (path) => {
        return "wasm/" + path;
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
        self.postMessage({
            type: "stdout",
            payload: "\n[JS] Loaded\n",
        });
        self.postMessage({
            type: "loaded",
            payload: true,
        });
        ffmpegModule = lib;
    })
    .catch(console.log);

self.onmessage = (msg) => {
    if (msg.data.type === "process") {
        const {payload: file} = msg.data;

        ffmpegModule.FS.mkdir('/working');
        ffmpegModule.FS.mount(ffmpegModule.FS.filesystems.WORKERFS, {
            blobs: [file]
        }, '/working');

        const filePath = '/working/' + file.name;
        const begin = performance.now()
        const exitCode = ffmpegModule.init(filePath)
        const end = performance.now();
        console.log(`init() exited with code ${exitCode}. Time: ${end-begin}ms`);
    }
};