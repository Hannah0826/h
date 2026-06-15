(function () {
  'use strict';

  const LOCAL_STT_HEALTH = 'http://127.0.0.1:8766/health';
  const LOCAL_STT_URL = 'http://127.0.0.1:8766/transcribe';
  const WHISPER_MODEL = 'Xenova/whisper-small';
  const TRANSFORMER_CDNS = [
    'https://esm.sh/@xenova/transformers@2.17.2',
    'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm',
    'https://unpkg.com/@xenova/transformers@2.17.2?module',
    'https://fastly.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm'
  ];

  let transformersModule = null;
  let transcriberPromise = null;
  let loadError = '';
  let localServerReady = null;
  let useLocalServer = false;

  async function probeLocalServer() {
    if (localServerReady !== null) return localServerReady;
    try {
      const res = await fetch(LOCAL_STT_HEALTH, { signal: AbortSignal.timeout(2500) });
      localServerReady = res.ok;
    } catch {
      localServerReady = false;
    }
    useLocalServer = localServerReady;
    return localServerReady;
  }

  async function loadTransformers() {
    if (transformersModule) return transformersModule;
    let lastError = null;
    for (const base of TRANSFORMER_CDNS) {
      try {
        transformersModule = await import(base);
        loadError = '';
        return transformersModule;
      } catch (err) {
        lastError = err;
      }
    }
    loadError = lastError?.message || '无法从网络加载浏览器识别库';
    throw lastError || new Error(loadError);
  }

  async function blobToMono16k(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer;
    try {
      audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      if (decodeCtx.close) await decodeCtx.close();
    }

    const targetRate = 16000;
    const length = Math.max(1, Math.ceil(audioBuffer.duration * targetRate));
    const offline = new OfflineAudioContext(1, length, targetRate);
    const source = offline.createBufferSource();
    const mono = offline.createBuffer(1, audioBuffer.length, audioBuffer.sampleRate);
    const out = mono.getChannelData(0);
    const ch0 = audioBuffer.getChannelData(0);

    if (audioBuffer.numberOfChannels === 1) {
      out.set(ch0);
    } else {
      const ch1 = audioBuffer.getChannelData(1);
      for (let i = 0; i < out.length; i += 1) {
        out[i] = (ch0[i] + ch1[i]) * 0.5;
      }
    }

    source.buffer = mono;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  }

  function getBrowserTranscriber(onStatus) {
    if (!transcriberPromise) {
      transcriberPromise = loadTransformers().then(({ env, pipeline }) => {
        env.backends.onnx.wasm.numThreads = 1;
        env.allowLocalModels = false;
        env.remoteHost = 'https://hf-mirror.com';
        return pipeline('automatic-speech-recognition', WHISPER_MODEL, {
          progress_callback: (data) => {
            if (!onStatus) return;
            if (data.status === 'progress' && data.total) {
              const pct = Math.min(100, Math.round((data.loaded / data.total) * 100));
              onStatus(`正在下载高精度识别模型… ${pct}%`);
            } else if (data.status === 'initiate') {
              onStatus('正在准备高精度语音识别…');
            } else if (data.status === 'done') {
              onStatus('高精度识别模型已就绪');
            }
          }
        });
      }).catch((err) => {
        transcriberPromise = null;
        loadError = err?.message || '浏览器模型加载失败';
        throw err;
      });
    }
    return transcriberPromise;
  }

  async function transcribeViaLocalServer(blob, onStatus) {
    if (!(await probeLocalServer())) return null;
    if (onStatus) onStatus('正在通过本地高精度语音服务识别…');
    const res = await fetch(LOCAL_STT_URL, {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': blob.type || 'audio/webm' },
      signal: AbortSignal.timeout(90000)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || '本地语音服务识别失败');
    }
    return String(data.text || '').trim();
  }

  async function transcribeViaBrowser(blob, onStatus) {
    if (onStatus) onStatus('正在解析录音…');
    const audio = await blobToMono16k(blob);
    if (audio.length < 4800) return '';

    if (onStatus) onStatus('正在加载高精度识别模型…');
    const transcriber = await getBrowserTranscriber(onStatus);
    if (onStatus) onStatus('正在识别你说的话…');

    const result = await transcriber(audio, {
      language: 'chinese',
      task: 'transcribe',
      chunk_length_s: 30,
      stride_length_s: 5,
      temperature: 0
    });
    return String(result?.text || '').trim();
  }

  async function transcribe(blob, onStatus) {
    if (!blob || blob.size < 200) return '';

    if (await probeLocalServer()) {
      return transcribeViaLocalServer(blob, onStatus);
    }

    return transcribeViaBrowser(blob, onStatus);
  }

  async function preload(onStatus) {
    if (await probeLocalServer()) {
      if (onStatus) onStatus('已连接本地高精度语音服务，可以直接说话～');
      return true;
    }
    if (onStatus) onStatus('未检测到本地语音服务，正在加载浏览器高精度模型…');
    return getBrowserTranscriber(onStatus);
  }

  window.SpeechFallback = {
    transcribe,
    preload,
    probeLocalServer,
    get loadError() { return loadError; },
    get ready() { return useLocalServer || !!transcriberPromise; },
    get mode() { return useLocalServer ? 'local-server' : 'browser'; }
  };
})();
