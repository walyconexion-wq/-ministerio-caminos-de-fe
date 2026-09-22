/**
 * FABRICA FFMPEG - SERVICIO WEBASSEMBLY CLIENT-SIDE
 * Ensambla los 3 clips de 10s (Gancho + Desarrollo + CTA) en 1 solo video final de 30s.
 * Corre 100% en el navegador del usuario sin requerir servidores pagos.
 */

class FabricaFFmpeg {
  constructor() {
    this.worker = null;
    this.loaded = false;
    this.msgId = 0;
    this.callbacks = new Map();
    this.logCb = null;
    this.progressCb = null;
  }

  async load(onLog) {
    if (this.loaded && this.worker) return;
    this.logCb = onLog || null;

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const coreURL = `${baseURL}/ffmpeg-core.js`;
    const wasmURL = `${baseURL}/ffmpeg-core.wasm`;

    const workerBlob = this.buildWorkerBlob();
    this.worker = new Worker(workerBlob);

    this.worker.onmessage = ({ data: { id, type, data } }) => {
      if (type === 'LOG') {
        if (this.logCb) this.logCb(data?.message || '');
        return;
      }
      if (type === 'PROGRESS') {
        if (this.progressCb) this.progressCb(data);
        return;
      }
      if (type === 'ERROR') {
        const cb = this.callbacks.get(id);
        if (cb) {
          this.callbacks.delete(id);
          cb.reject(new Error(data));
        }
        return;
      }
      const cb = this.callbacks.get(id);
      if (cb) {
        this.callbacks.delete(id);
        cb.resolve(data);
      }
    };

    await this.send('LOAD', { coreURL, wasmURL });
    this.loaded = true;
  }

  send(type, data) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.worker.postMessage({ id, type, data });
    });
  }

  buildWorkerBlob() {
    const script = `
var MSG = { LOAD: "LOAD", EXEC: "EXEC", WRITE_FILE: "WRITE_FILE", READ_FILE: "READ_FILE", DELETE_FILE: "DELETE_FILE", ERROR: "ERROR", LOG: "LOG", PROGRESS: "PROGRESS" };
var ffmpeg = null;

var load = function(opts) {
  importScripts(opts.coreURL);
  return self.createFFmpegCore({
    mainScriptUrlOrBlob: opts.coreURL + "#" + btoa(JSON.stringify({ wasmURL: opts.wasmURL }))
  }).then(function(core) {
    ffmpeg = core;
    ffmpeg.setLogger(function(data) { self.postMessage({ type: MSG.LOG, data: data }); });
    ffmpeg.setProgress(function(data) { self.postMessage({ type: MSG.PROGRESS, data: data }); });
    return true;
  });
};

self.onmessage = function(e) {
  var id = e.data.id; var type = e.data.type; var _data = e.data.data; var trans = []; var data;
  var handleResult = function(result) {
    data = result;
    if (data instanceof Uint8Array) trans.push(data.buffer);
    self.postMessage({ id: id, type: type, data: data }, trans);
  };
  var handleError = function(err) {
    self.postMessage({ id: id, type: MSG.ERROR, data: err ? err.toString() : 'Unknown error' });
  };

  try {
    if (type !== MSG.LOAD && !ffmpeg) {
      handleError(new Error("FFmpeg no está cargado aún"));
      return;
    }
    switch (type) {
      case MSG.LOAD:
        load(_data).then(handleResult).catch(handleError);
        return;
      case MSG.EXEC:
        ffmpeg.setTimeout(_data.timeout || -1);
        ffmpeg.exec.apply(ffmpeg, _data.args);
        data = ffmpeg.ret;
        ffmpeg.reset();
        break;
      case MSG.WRITE_FILE:
        ffmpeg.FS.writeFile(_data.path, _data.data);
        data = true;
        break;
      case MSG.READ_FILE:
        data = ffmpeg.FS.readFile(_data.path);
        break;
      case MSG.DELETE_FILE:
        ffmpeg.FS.unlink(_data.path);
        data = true;
        break;
      default:
        handleError(new Error("Tipo de mensaje no reconocido: " + type));
        return;
    }
  } catch (err) {
    handleError(err);
    return;
  }
  if (data instanceof Uint8Array) trans.push(data.buffer);
  self.postMessage({ id: id, type: type, data: data }, trans);
};`;
    return URL.createObjectURL(new Blob([script], { type: 'text/javascript' }));
  }

  async exec(args) {
    return this.send('EXEC', { args, timeout: -1 });
  }

  async writeFile(name, data) {
    return this.send('WRITE_FILE', { path: name, data });
  }

  async readFile(name) {
    return this.send('READ_FILE', { path: name });
  }

  async deleteFile(name) {
    return this.send('DELETE_FILE', { path: name });
  }

  onProgress(cb) {
    this.progressCb = cb;
  }

  /**
   * Concatena múltiples clips en un solo archivo MP4 master de 30s
   * @param {Array<{ bytes: Uint8Array }>} clips
   * @param {(status: string, progress: number) => void} onStatusUpdate
   * @returns {Promise<Blob>} Blob del MP4 ensamblado
   */
  async assembleClips(clips, onStatusUpdate) {
    await this.load();
    const fileNames = [];

    try {
      for (let i = 0; i < clips.length; i++) {
        const fileName = `clip_${i}.mp4`;
        fileNames.push(fileName);
        if (onStatusUpdate) onStatusUpdate(`Cargando pieza ${i + 1} de ${clips.length}...`, Math.round((i / clips.length) * 30));
        await this.writeFile(fileName, clips[i].bytes);
      }

      if (onStatusUpdate) onStatusUpdate('Ensamblando misil de 30s con FFmpeg...', 50);

      const inputArgs = [];
      fileNames.forEach(name => inputArgs.push('-i', name));
      const filterInputs = fileNames.map((_, i) => `[${i}:v][${i}:a]`).join('');
      const filterComplex = `${filterInputs}concat=n=${fileNames.length}:v=1:a=1[outv][outa]`;

      await this.exec([
        ...inputArgs,
        '-filter_complex', filterComplex,
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-movflags', 'faststart',
        '-y', 'final_missile.mp4'
      ]);

      if (onStatusUpdate) onStatusUpdate('Generando archivo final...', 90);

      const data = await this.readFile('final_missile.mp4');
      const blob = new Blob([data.buffer], { type: 'video/mp4' });

      // Limpieza de memoria
      for (const name of fileNames) {
        try { await this.deleteFile(name); } catch(e) {}
      }
      try { await this.deleteFile('final_missile.mp4'); } catch(e) {}

      if (onStatusUpdate) onStatusUpdate('¡Ensamblaje completado con éxito!', 100);
      return blob;

    } catch (err) {
      // Limpieza de emergencia
      for (const name of fileNames) {
        try { await this.deleteFile(name); } catch(e) {}
      }
      throw err;
    }
  }
}

window.fabricaFFmpeg = new FabricaFFmpeg();
