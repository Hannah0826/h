(() => {
  'use strict';

  const EMOTIONS = [
    { id: 'hungry', name: '撒娇求食', cat: '😺', hint: '它想吃东西啦', replies: ['主人我饿啦，快开饭～', '肚子咕咕叫，给点小鱼干嘛～', '喵～该吃饭时间了吧？'] },
    { id: 'affectionate', name: '蹭蹭撒娇', cat: '🐱', hint: '它很开心想贴贴', replies: ['最喜欢你啦，再摸摸头～', '呼噜呼噜～好舒服呀', '贴贴！今天也要一起玩～'] },
    { id: 'irritable', name: '有点生气', cat: '😾', hint: '它不太高兴', replies: ['哼，不要这样嘛…', '喵！我生气啦！', '再这样我就不理你了哦'] },
    { id: 'lonely', name: '孤单呼唤', cat: '🐈', hint: '它想有人陪', replies: ['你在哪呀…陪陪我嘛', '一个人好无聊，快来找我', '喵呜…不要走太远哦'] },
    { id: 'alert', name: '兴奋警觉', cat: '🙀', hint: '它发现了有趣的事', replies: ['外面有动静！快看快看！', '喵！那个东西好有趣！', '兴奋模式开启！一起玩吧！'] }
  ];

  const CHAT_SCENARIOS = [
    { id: 'play', keywords: ['出去玩', '出去', '出门', '外面玩', '玩怎么样', '散步', '逛街', '去外面', '带出去'], video: 'assets/videos/play.mp4', caption: '小猫开心地跟你一起出去玩啦！', emotion: 'alert', replies: ['喵！出去玩！快带我出去～', '好呀好呀，外面的风好舒服！', '冲呀！今天也要到处探险！'] },
    { id: 'fish', keywords: ['小鱼干', '小鱼', '鱼干', '吃小鱼', '零食', '罐头', '开饭', '饿了', '吃东西'], video: 'assets/videos/fish.mp4', caption: '小猫正在享用美味小鱼干～', emotion: 'hungry', replies: ['喵呜～小鱼干！我的最爱！', '谢谢主人！咔嚓咔嚓真香～', '再来一条好不好嘛～'] },
    { id: 'alone', keywords: ['独自呆着', '独自', '自己呆', '一个人', '自己玩', '留在家', '我不在', '先走'], video: 'assets/videos/alone.mp4', caption: '小猫独自呆着，看起来有点寂寞…', emotion: 'lonely', replies: ['喵…你真的要走吗…', '我会乖乖等的，早点回来哦', '好吧…那我先自己待一会儿'] },
    { id: 'pet', keywords: ['抚摸', '摸摸', '摸头', '摸一下', '可以摸', '撸猫', '抱', '亲亲', '贴贴'], video: 'assets/videos/pet.mp4', caption: '小猫被抚摸，呼噜呼噜超满足～', emotion: 'affectionate', replies: ['呼噜呼噜～再摸一下嘛～', '好舒服呀，最喜欢你摸我了', '喵～手心好温暖～'] }
  ];

  const CHAT_INTENTS = [
    {
      test: /你好|您好|嗨|哈喽|早上好|中午好|晚上好|在吗|在不在|hello|hi/i,
      reply: (t) => pickOne([
        `喵～你好呀主人！小橘在呢，今天想聊「${shortText(t)}」还是直接摸摸我？`,
        '你好你好！小橘刚刚就在等你说话呢～',
        '喵呜～听到你的声音啦，好开心！'
      ])
    },
    {
      test: /叫什么|名字|你是谁|你叫啥|哪只猫/i,
      reply: () => pickOne([
        '我是小橘！是你家最会撒娇、最懂喵语的那只～',
        '喵～我叫小橘，专门负责陪你聊天和卖萌！',
        '小橘小橘！记住这个名字，以后多多来找我玩～'
      ])
    },
    {
      test: /漂亮|可爱|乖|棒|厉害|聪明|喜欢你|爱你|好猫/i,
      reply: (t) => pickOne([
        `嘿嘿，主人说「${shortText(t)}」，小橘尾巴都要翘上天啦～`,
        '被夸奖了！呼噜呼噜～小橘也要说，最喜欢你！',
        '喵呜～那小橘今天要多蹭你三下当作回礼！'
      ])
    },
    {
      test: /谢谢|感谢|多谢|辛苦/i,
      reply: () => pickOne([
        '不客气喵～能帮到你，小橘也很开心！',
        '嘿嘿，主人太客气啦，给个摸头奖励就好～',
        '喵～我们之间不用谢，贴贴就够了！'
      ])
    },
    {
      test: /再见|拜拜|下次见|我走了|先走|回头见|晚安/i,
      reply: (t) => pickOne([
        `喵…「${shortText(t)}」吗？那要记得早点回来找小橘哦～`,
        '拜拜主人！我会在这里等你下次来找我～',
        '走好呀，门关上之前再摸我一下嘛～'
      ])
    },
    {
      test: /睡觉|困|好累|休息|打盹/i,
      reply: () => pickOne([
        '那小橘也蜷成一团，陪你一起打盹～呼噜…',
        '困困喵…眼睛眯成一条线了，但要听你说话还是可以！',
        '晚安的话，小橘会把小爪子放在你手背上哦～'
      ])
    },
    {
      test: /为什么|怎么|为何|啥意思|什么意思/i,
      reply: (t) => pickOne([
        `「${shortText(t)}」呀…让小橘用喵语翻译：主人说的很有道理！`,
        '这是个好问题！小橘也在认真听，然后疯狂点头中～',
        '喵～简单说就是：小橘超想听懂你的每一句话！'
      ])
    },
    {
      test: /不开心|难过|伤心|生气|烦|累/i,
      reply: (t) => pickOne([
        `听到「${shortText(t)}」…小橘过来蹭蹭你，别难过喵～`,
        '主人不开心的话，小橘可以当你的暖手宝哦～',
        '喵呜…让小橘陪你待一会儿，心情会好一点的！'
      ])
    }
  ];

  const STORAGE = { voiceCount: 'cat_voice_count', gameScore: 'cat_game_score', intimacy: 'cat_intimacy' };
  const INTIMACY_GAIN = { jumpWin: 5, jumpLose: 2 };
  const SPEECH_REPLACEMENTS = [
    ['小余干', '小鱼干'], ['小鱼甘', '小鱼干'], ['小渔干', '小鱼干'], ['鱼甘', '鱼干'],
    ['出区玩', '出去玩'], ['出去完', '出去玩'], ['出取玩', '出去玩'],
    ['摸投', '摸头'], ['摸透', '摸头'], ['莫头', '摸头'],
    ['小菊', '小橘'], ['小桔', '小橘'], ['小橘猫', '小橘'],
    ['独自待', '独自呆'], ['自己待', '自己呆'],
    ['撸毛', '撸猫'], ['摸猫', '摸猫']
  ];
  const BG_MODES = ['intro', 'home', 'chat', 'jump', 'default'];

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const els = {
    skyBg: $('#skyBg'),
    introOverlay: $('#introOverlay'),
    sceneParticles: $('#sceneParticles'),
    chatCat: $('#chatCat'),
    catMainImage: $('#catMainImage'),
    hintBubbles: $('#hintBubbles'),
    videoOverlay: $('#videoOverlay'),
    sceneVideo: $('#sceneVideo'),
    videoCaption: $('#videoCaption'),
    videoClose: $('#videoClose'),
    winOverlay: $('#winOverlay'),
    winVideo: $('#winVideo'),
    winRetryBtn: $('#winRetryBtn'),
    winHomeBtn: $('#winHomeBtn'),
    enterBtn: $('#enterBtn'),
    introMicBtn: $('#introMicBtn'),
    introMicHint: $('#introMicHint'),
    bgm: $('#bgm'),
    voiceCount: $('#voiceCount'),
    gameScore: $('#gameScore'),
    intimacyScore: $('#intimacyScore'),
    winIntimacyMsg: $('#winIntimacyMsg'),
    navCards: $$('.nav-card'),
    backBtns: $$('.back-btn'),
    micBtn: $('#micBtn'),
    recordingRings: $('#recordingRings'),
    chatLog: $('#chatLog'),
    chatStatus: $('#chatStatus'),
    jumpCanvas: $('#jumpCanvas'),
    jumpVolumeFill: $('#jumpVolumeFill'),
    jumpStartBtn: $('#jumpStartBtn'),
    jumpRetryBtn: $('#jumpRetryBtn'),
    jumpStatus: $('#jumpStatus'),
    jumpStatusText: $('#jumpStatusText')
  };

  const audio = new CatAudioEngine();
  let recognition = null;
  let recording = false;
  let sessionTranscript = '';
  let lastInterimTranscript = '';
  let awaitingRecognition = false;
  let recognitionFinishTimer = null;
  let stopDelayTimer = null;
  let recordStartedAt = 0;
  let globalStopBound = false;
  let audioReady = false;
  let micStream = null;
  let micAnalyser = null;
  let micData = null;
  let micAnimFrame = null;
  let micReady = false;
  let audioLevel = 0;
  let sessionHadMicAudio = false;
  let sessionSpeechError = '';
  let mediaRecorder = null;
  let audioChunks = [];
  let pendingAudioBlobPromise = null;
  let micInitPromise = null;

  const MIC_CONSTRAINTS = {
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    }
  };

  async function ensureSharedMic() {
    if (micReady && micStream && micAnalyser) return true;
    if (micInitPromise) return micInitPromise;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      return false;
    }

    micInitPromise = (async () => {
      try {
        if (!micStream) {
          micStream = await navigator.mediaDevices.getUserMedia(MIC_CONSTRAINTS);
          audio.init();
          await audio.ensureContext();
          const source = audio.ctx.createMediaStreamSource(micStream);
          micAnalyser = audio.ctx.createAnalyser();
          micAnalyser.fftSize = 256;
          micData = new Uint8Array(micAnalyser.frequencyBinCount);
          source.connect(micAnalyser);
        }
        micReady = true;
        if (window.JumpGame?.setMicSource) {
          JumpGame.setMicSource(micAnalyser, micData);
        }
        return true;
      } catch {
        micReady = false;
        return false;
      } finally {
        micInitPromise = null;
      }
    })();

    return micInitPromise;
  }

  function updateIntroMicStatus() {
    if (!els.introMicHint || !els.introMicBtn) return;
    if (micReady) {
      els.introMicHint.textContent = '麦克风已就绪，可以开始游戏啦 ✓';
      els.introMicBtn.textContent = '✓ 麦克风已允许';
      els.introMicBtn.classList.add('mic-granted');
      els.introMicBtn.disabled = true;
    }
  }

  async function requestIntroMic() {
    if (micReady) {
      updateIntroMicStatus();
      return true;
    }
    if (!window.isSecureContext) {
      if (els.introMicHint) {
        els.introMicHint.textContent = '请用 http://localhost:8765 打开，不要直接双击 html 文件';
      }
      return false;
    }
    if (els.introMicHint) els.introMicHint.textContent = '请在浏览器弹窗中点击「允许」…';
    const ok = await ensureSharedMic();
    if (ok) {
      updateIntroMicStatus();
    } else if (els.introMicHint) {
      els.introMicHint.textContent = '还没获得权限，请再点一次「允许使用麦克风」';
    }
    return ok;
  }

  const readStore = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function getSpeechHintWords() {
    const words = new Set([
      '小橘', '小猫', '喵', '你好', '您好', '哈喽', '谢谢', '再见', '拜拜',
      '喜欢', '可爱', '漂亮', '睡觉', '困', '开心', '难过'
    ]);
    CHAT_SCENARIOS.forEach((scene) => {
      scene.keywords.forEach((kw) => words.add(kw));
    });
    return words;
  }

  function polishTranscript(text) {
    let t = String(text || '').trim();
    if (!t) return '';
    t = t.replace(/[\u200b-\u200d\ufeff]/g, '');
    t = t.replace(/\s+/g, '');
    t = t.replace(/[，,。.!！?？~～…]+$/g, '');
    SPEECH_REPLACEMENTS.forEach(([from, to]) => {
      t = t.split(from).join(to);
    });
    return t.trim();
  }

  function transcriptScore(text) {
    if (!text) return 0;
    let score = Math.min(text.length, 40);
    getSpeechHintWords().forEach((word) => {
      if (text.includes(word)) score += word.length + 6;
    });
    if (/[\u4e00-\u9fff]/.test(text)) score += 8;
    if (/^[a-zA-Z\s]+$/.test(text)) score -= 12;
    if (text.length <= 1) score -= 6;
    return score;
  }

  function chooseBestTranscript(webText, localText) {
    const web = polishTranscript(webText);
    const local = polishTranscript(localText);
    if (web && local) {
      const webScore = transcriptScore(web);
      const localScore = transcriptScore(local);
      if (localScore >= webScore + 4) return local;
      if (webScore >= localScore + 4) return web;
      return local.length >= web.length ? local : web;
    }
    return local || web || '';
  }

  function pickBestAlternative(result) {
    let best = '';
    let bestScore = -1;
    for (let i = 0; i < result.length; i += 1) {
      const candidate = polishTranscript(result[i].transcript);
      if (!candidate) continue;
      const score = transcriptScore(candidate) + (result[i].confidence || 0) * 12;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  }

  const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
  const shortText = (text, max = 14) => {
    const t = String(text || '').trim();
    return t.length > max ? `${t.slice(0, max)}…` : t;
  };

  function pickScenarioSmartReply(text, scenario) {
    const snippet = shortText(text);
    const contextual = {
      play: [
        `「${snippet}」？好耶！小橘已经跑到门口等你啦～`,
        `你说想出去，小橘尾巴都摇成螺旋桨了！`,
        ...scenario.replies
      ],
      fish: [
        `听到「${snippet}」！小鱼干时间到～咔嚓咔嚓！`,
        `主人提到吃的，小橘口水都要滴下来了喵～`,
        ...scenario.replies
      ],
      alone: [
        `「${snippet}」…那小橘会乖乖在家，但你要早点回来哦`,
        `好吧，小橘自己待着也行，但会偷偷想你的…`,
        ...scenario.replies
      ],
      pet: [
        `「${snippet}」？小橘立刻躺平露出肚皮～呼噜呼噜～`,
        `主人想摸我？那小橘已经把脑袋凑过来了！`,
        ...scenario.replies
      ]
    };
    return pickOne(contextual[scenario.id] || scenario.replies);
  }

  function generateSmartReply(text, emotion) {
    const t = String(text || '').trim();
    const scenario = detectChatScenario(t);
    if (scenario) return pickScenarioSmartReply(t, scenario);

    for (const intent of CHAT_INTENTS) {
      if (intent.test.test(t)) return intent.reply(t);
    }

    const snippet = shortText(t);
    const contextual = {
      hungry: [
        `喵～你提到「${snippet}」，小橘肚子也咕咕叫了呢～`,
        `听到「${snippet}」！开饭铃在小橘脑子里响了！`,
        ...emotion.replies
      ],
      affectionate: [
        `「${snippet}」？小橘听完好开心，想立刻蹭过来～`,
        `主人说的「${snippet}」让小橘心里暖暖的！`,
        ...emotion.replies
      ],
      irritable: [
        `「${snippet}」…小橘有点炸毛了，但还是会听你的啦`,
        `喵！关于「${snippet}」，小橘表示抗议！`,
        ...emotion.replies
      ],
      lonely: [
        `「${snippet}」…小橘不想一个人，陪陪我嘛～`,
        `你说「${snippet}」，小橘更想黏着你了…`,
        ...emotion.replies
      ],
      alert: [
        `「${snippet}」！小橘耳朵竖起来啦，好兴奋！`,
        `听到「${snippet}」，小橘想立刻行动起来！`,
        ...emotion.replies
      ]
    };

    return pickOne(contextual[emotion.id] || emotion.replies);
  }

  function setPageBackground(mode) {
    if (!els.skyBg) return;
    BG_MODES.forEach((m) => els.skyBg.classList.remove(`bg-mode-${m}`));
    els.skyBg.classList.add(`bg-mode-${BG_MODES.includes(mode) ? mode : 'default'}`);
  }

  async function primeAudio() {
    if (audioReady) return;
    audio.init();
    await audio.ensureContext();
    audioReady = true;
  }

  function playBgm() {
    try {
      els.bgm.src = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_9385a59e7d.mp3?filename=cozy-place-118316.mp3';
      els.bgm.volume = 0.15;
      els.bgm.play().catch(() => {});
    } catch {}
  }

  function applyCatMood(mood, target) {
    if (!target) return;
    target.classList.remove('cat-happy', 'cat-sad', 'cat-angry', 'cat-listening', 'cat-recording');
    if (mood) target.classList.add(mood);
  }

  function detectChatScenario(text) {
    const t = String(text || '');
    return CHAT_SCENARIOS.find((scene) => scene.keywords.some((kw) => t.includes(kw))) || null;
  }

  function pickEmotionByText(text) {
    const scenario = detectChatScenario(text);
    if (scenario) {
      const base = EMOTIONS.find((e) => e.id === scenario.emotion) || EMOTIONS[1];
      return { ...base, replies: scenario.replies, scenario };
    }
    const t = String(text || '');
    if (/饭|饿|吃|喂|零食|罐头|肉/.test(t)) return EMOTIONS[0];
    if (/抱|摸|陪|亲|爱|喜欢|乖|可爱|贴贴|撸/.test(t)) return EMOTIONS[1];
    if (/别|停|不|走开|禁止|讨厌|生气|不要|烦/.test(t)) return EMOTIONS[2];
    if (/在哪|回来|想你|陪我|孤单|无聊|寂寞|独自/.test(t)) return EMOTIONS[3];
    if (/玩|球|跑|跳|门|声音|看|出去|探险|闯关/.test(t)) return EMOTIONS[4];
    return EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
  }

  function clearListeningVisuals() {
    if (!els.chatCat) return;
    els.chatCat.style.removeProperty('--sway-deg');
    els.chatCat.style.removeProperty('--echo-speed');
    els.chatCat.style.removeProperty('--listen-sway-speed');
  }

  function updateListeningVisuals(level) {
    if (!els.chatCat || !recording) return;
    const sway = 5 + level * 11;
    const echoSpeed = Math.max(0.9, 2.4 - level * 1.4);
    const swaySpeed = Math.max(0.75, 1.25 - level * 0.35);
    els.chatCat.style.setProperty('--sway-deg', `${sway.toFixed(1)}deg`);
    els.chatCat.style.setProperty('--echo-speed', `${echoSpeed.toFixed(2)}s`);
    els.chatCat.style.setProperty('--listen-sway-speed', `${swaySpeed.toFixed(2)}s`);
  }

  async function initChatMic() {
    if (!window.isSecureContext) {
      els.chatStatus.textContent = '请用本地服务器打开（如 http://localhost:8765），不要直接双击 html 文件';
      els.micBtn.classList.add('mic-denied');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      els.chatStatus.textContent = '当前浏览器不支持麦克风，请使用 Chrome 或 Edge';
      els.micBtn.classList.add('mic-denied');
      return;
    }
    if (micReady) {
      els.micBtn.classList.add('mic-ready');
      els.micBtn.classList.remove('mic-denied');
      els.chatStatus.textContent = '麦克风已就绪，长按说话和小猫交流吧～';
      return;
    }
    els.chatStatus.textContent = '正在准备麦克风…';
    const ok = await ensureSharedMic();
    if (ok) {
      els.micBtn.classList.add('mic-ready');
      els.micBtn.classList.remove('mic-denied');
      const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      els.chatStatus.textContent = hasSpeech
        ? '麦克风已就绪。推荐另开终端运行 python stt_server.py'
        : '麦克风已就绪。请运行 python stt_server.py 启用语音';
    } else {
      micReady = false;
      els.micBtn.classList.add('mic-denied');
      els.chatStatus.textContent = '请允许麦克风权限，才能和小猫对话哦';
    }
  }

  function stopMicMonitor() {
    if (micAnimFrame) cancelAnimationFrame(micAnimFrame);
    micAnimFrame = null;
    audioLevel = 0;
    clearListeningVisuals();
  }

  function startMicMonitor() {
    stopMicMonitor();
    const tick = () => {
      if (!micAnalyser || !micData) return;
      micAnalyser.getByteFrequencyData(micData);
      let sum = 0;
      for (let i = 0; i < micData.length; i += 1) sum += micData[i];
      audioLevel = sum / (micData.length * 255);
      if (recording && audioLevel > 0.08) sessionHadMicAudio = true;
      updateListeningVisuals(audioLevel);
      if (recording && audioLevel > 0.1 && !sessionTranscript && !lastInterimTranscript) {
        els.chatStatus.textContent = '收到声音了，请清晰说出你想对小猫说的话…';
      }
      if (recording) micAnimFrame = requestAnimationFrame(tick);
    };
    micAnimFrame = requestAnimationFrame(tick);
  }

  function showScenarioVideo(scenario) {
    if (!scenario?.video || !els.videoOverlay) return;
    els.videoCaption.textContent = scenario.caption;
    els.sceneVideo.src = scenario.video;
    els.videoOverlay.classList.remove('hidden');
    els.sceneVideo.currentTime = 0;
    els.sceneVideo.play().catch(() => {});
  }

  function closeScenarioVideo() {
    if (!els.videoOverlay) return;
    els.videoOverlay.classList.add('hidden');
    if (els.sceneVideo) {
      els.sceneVideo.pause();
      els.sceneVideo.removeAttribute('src');
      els.sceneVideo.load();
    }
  }

  function addIntimacy(amount) {
    const next = readStore(STORAGE.intimacy, 0) + amount;
    writeStore(STORAGE.intimacy, next);
    updateStats();
    return next;
  }

  function showWinScreen() {
    writeStore(STORAGE.gameScore, readStore(STORAGE.gameScore, 0) + 1);
    addIntimacy(INTIMACY_GAIN.jumpWin);
    updateStats();
    if (els.winIntimacyMsg) {
      els.winIntimacyMsg.textContent = `小猫终于吃到了终点的小鱼干～亲密度 +${INTIMACY_GAIN.jumpWin}`;
    }
    if (els.winOverlay) els.winOverlay.classList.remove('hidden');
    if (els.winVideo) {
      els.winVideo.currentTime = 0;
      els.winVideo.play().catch(() => {});
    }
    audio.playMeow('hungry', 1);
  }

  function hideWinScreen() {
    if (els.winOverlay) els.winOverlay.classList.add('hidden');
    if (els.winVideo) els.winVideo.pause();
  }

  async function playMeowFeedback(emotion = 'affectionate') {
    await primeAudio();
    audio.playMeow(emotion, 1);
  }

  function showScreen(id) {
    if (document.querySelector('#screen-chat.active') && id !== 'chat') {
      stopRecording(false);
      unbindGlobalStopListeners();
      stopMicMonitor();
      applyCatMood('', els.chatCat);
    }
    if (id !== 'jump' && window.JumpGame) JumpGame.stop();

    $$('.panel').forEach((p) => p.classList.remove('active'));
    const screen = document.querySelector(`#screen-${id}`);
    if (screen) screen.classList.add('active');

    if (id === 'home') setPageBackground('home');
    else if (id === 'chat') setPageBackground('chat');
    else if (id === 'jump') setPageBackground('jump');
    else setPageBackground('default');

    playMeowFeedback();
    if (id === 'chat') {
      void initChatMic();
      void preloadSpeechModel();
    }
    if (id === 'jump') initJumpScreen();
  }

  function updateStats() {
    els.voiceCount.textContent = readStore(STORAGE.voiceCount, 0);
    els.gameScore.textContent = readStore(STORAGE.gameScore, 0);
    if (els.intimacyScore) els.intimacyScore.textContent = readStore(STORAGE.intimacy, 0);
  }

  function appendChatBubble(text, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user-bubble' : 'cat-bubble'}`;
    bubble.innerHTML = `
      <span class="bubble-avatar">${isUser ? '🧑' : '🐱'}</span>
      <div class="bubble-body"><p>${text}</p></div>
    `;
    els.chatLog.appendChild(bubble);
    els.chatLog.scrollTop = els.chatLog.scrollHeight;
  }

  function pickRecorderMime() {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  }

  function startAudioCapture() {
    audioChunks = [];
    if (!micStream || typeof MediaRecorder === 'undefined') return;
    try {
      const mimeType = pickRecorderMime();
      mediaRecorder = mimeType
        ? new MediaRecorder(micStream, { mimeType })
        : new MediaRecorder(micStream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size) audioChunks.push(event.data);
      };
      mediaRecorder.start(250);
    } catch {
      mediaRecorder = null;
    }
  }

  function stopAudioCapture() {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        const mimeType = pickRecorderMime() || 'audio/webm';
        resolve(audioChunks.length ? new Blob(audioChunks, { type: mimeType }) : null);
        mediaRecorder = null;
        audioChunks = [];
        return;
      }
      const mimeType = mediaRecorder.mimeType || pickRecorderMime() || 'audio/webm';
      mediaRecorder.onstop = () => {
        const blob = audioChunks.length ? new Blob(audioChunks, { type: mimeType }) : null;
        mediaRecorder = null;
        audioChunks = [];
        resolve(blob);
      };
      try {
        if (mediaRecorder.state === 'recording') mediaRecorder.requestData();
        mediaRecorder.stop();
      } catch {
        mediaRecorder = null;
        audioChunks = [];
        resolve(null);
      }
    });
  }

  function showNoSpeechStatus(fallbackTried = false) {
    if (sessionSpeechError === 'network') {
      els.chatStatus.textContent = '在线语音识别连不上网。若本地模型也失败，请刷新页面并等待模型下载完成';
      return;
    }
    if (sessionHadMicAudio) {
      if (window.SpeechFallback?.loadError) {
        els.chatStatus.textContent = `语音识别不可用：${window.SpeechFallback.loadError}。请运行 python stt_server.py`;
      } else if (fallbackTried) {
        els.chatStatus.textContent = '没听清，请再说一遍；或运行 python stt_server.py 开启本地语音服务';
      } else {
        els.chatStatus.textContent = '麦克风有声音但未识别。建议运行 python stt_server.py';
      }
      return;
    }
    els.chatStatus.textContent = '没有检测到说话声音：请靠近麦克风、提高音量，按住至少 1 秒后再松开';
  }

  async function tryFinishWithFallback() {
    await finalizeTranscript();
  }

  async function finalizeTranscript() {
    const webText = polishTranscript(sessionTranscript.trim() || lastInterimTranscript.trim());
    const blob = pendingAudioBlobPromise ? await pendingAudioBlobPromise : null;
    pendingAudioBlobPromise = null;

    if (!sessionHadMicAudio && !webText) {
      showNoSpeechStatus(false);
      return;
    }

    let localText = '';
    if (blob && blob.size > 200 && window.SpeechFallback?.transcribe) {
      try {
        els.chatStatus.textContent = webText ? '正在用本地模型复核识别…' : '正在用本地模型识别…';
        localText = await window.SpeechFallback.transcribe(blob, (status) => {
          els.chatStatus.textContent = status;
        });
      } catch (err) {
        console.error(err);
        if (!webText) {
          els.chatStatus.textContent = `本地识别出错：${err?.message || '未知错误'}。请再试一次`;
          return;
        }
      }
    } else if (!webText && (!blob || blob.size <= 200)) {
      els.chatStatus.textContent = '录音太短，请按住麦克风至少 1 秒并说话';
      return;
    } else if (!webText && !window.SpeechFallback?.transcribe) {
      els.chatStatus.textContent = '语音识别脚本未加载，请刷新页面';
      return;
    }

    const best = chooseBestTranscript(webText, localText);
    if (best) {
      respondToVoice(best);
      return;
    }

    showNoSpeechStatus(true);
  }

  function clearStopDelayTimer() {
    if (stopDelayTimer) {
      clearTimeout(stopDelayTimer);
      stopDelayTimer = null;
    }
  }

  function clearRecognitionFinishTimer() {
    if (recognitionFinishTimer) {
      clearTimeout(recognitionFinishTimer);
      recognitionFinishTimer = null;
    }
  }

  function resetRecordingUI() {
    stopMicMonitor();
    applyCatMood('', els.chatCat);
    els.micBtn.classList.remove('recording');
    els.recordingRings.classList.add('hidden');
  }

  function bindGlobalStopListeners() {
    if (globalStopBound) return;
    globalStopBound = true;
    document.addEventListener('mouseup', handleGlobalStop);
    document.addEventListener('touchend', handleGlobalStop, { passive: true });
  }

  function unbindGlobalStopListeners() {
    if (!globalStopBound) return;
    globalStopBound = false;
    document.removeEventListener('mouseup', handleGlobalStop);
    document.removeEventListener('touchend', handleGlobalStop);
  }

  function handleGlobalStop() {
    if (recording) stopRecording(true);
  }

  function stopSpeechRecognition() {
    clearRecognitionFinishTimer();
    clearStopDelayTimer();
    awaitingRecognition = false;
    if (!recognition) return;
    try { recognition.abort(); } catch {}
    recognition = null;
  }

  function restartRecognitionIfRecording() {
    if (!recording || awaitingRecognition) return;
    const savedText = sessionTranscript;
    const savedInterim = lastInterimTranscript;
    try {
      if (recognition) {
        recognition.start();
        return;
      }
    } catch {}
    if (startSpeechRecognition(true)) {
      sessionTranscript = savedText;
      lastInterimTranscript = savedInterim;
    }
  }

  function startSpeechRecognition(preserveTranscript = false) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;

    const savedText = preserveTranscript ? sessionTranscript : '';
    const savedInterim = preserveTranscript ? lastInterimTranscript : '';
    stopSpeechRecognition();
    if (!preserveTranscript) {
      sessionTranscript = '';
      lastInterimTranscript = '';
    } else {
      sessionTranscript = savedText;
      lastInterimTranscript = savedInterim;
    }
    recognition = createRecognition();
    if (!recognition) return false;

    try {
      recognition.start();
      return true;
    } catch {
      try {
        recognition = createRecognition();
        recognition.start();
        return true;
      } catch {
        recognition = null;
        return false;
      }
    }
  }

  function speechErrorMessage(errorCode) {
    switch (errorCode) {
      case 'not-allowed':
      case 'service-not-allowed':
        return '麦克风或语音识别权限被拒绝，请在浏览器地址栏允许权限';
      case 'no-speech':
        return '没有听到声音，请靠近麦克风再试一次';
      case 'network':
        return '语音识别需要联网（Chrome/Edge 会使用在线识别服务）';
      case 'audio-capture':
        return '无法使用麦克风，请检查是否被其他程序占用';
      case 'aborted':
        return '';
      default:
        return errorCode ? `语音识别失败：${errorCode}` : '语音识别失败，请重试';
    }
  }

  function createRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = 'zh-CN';
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 3;

    r.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i].isFinal) {
          finalText += pickBestAlternative(event.results[i]);
        } else {
          interimText += polishTranscript(event.results[i][0].transcript);
        }
      }
      if (finalText) {
        sessionTranscript = polishTranscript(`${sessionTranscript}${finalText}`);
      }
      if (interimText) {
        lastInterimTranscript = interimText;
        if (recording || awaitingRecognition) {
          els.chatStatus.textContent = `听到：${lastInterimTranscript}…`;
        }
      } else if (finalText && (recording || awaitingRecognition)) {
        els.chatStatus.textContent = `听到：${sessionTranscript}…`;
      }
    };

    r.onstart = () => {
      if (recording) els.chatStatus.textContent = '正在听你说话…说完松开麦克风';
    };

    r.onerror = (event) => {
      if (event.error === 'aborted') return;
      if (recording || awaitingRecognition) sessionSpeechError = event.error;
      if (event.error === 'no-speech') {
        if (recording) {
          setTimeout(restartRecognitionIfRecording, 150);
          return;
        }
        if (awaitingRecognition) finishRecordingResponse();
        return;
      }
      const message = speechErrorMessage(event.error);
      if (message) els.chatStatus.textContent = message;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        micReady = false;
        els.micBtn.classList.add('mic-denied');
        els.micBtn.classList.remove('mic-ready');
      }
    };

    r.onend = () => {
      if (recording) {
        setTimeout(restartRecognitionIfRecording, 120);
        return;
      }
      if (awaitingRecognition) finishRecordingResponse();
    };

    return r;
  }

  function finishRecordingResponse() {
    if (!awaitingRecognition) return;
    awaitingRecognition = false;
    clearRecognitionFinishTimer();
    clearStopDelayTimer();
    unbindGlobalStopListeners();
    resetRecordingUI();
    void finalizeTranscript();
  }

  async function startRecording() {
    if (recording || awaitingRecognition) return;
    if (!window.isSecureContext) {
      alert('请用本地服务器打开页面（如 http://localhost:8765），不要直接双击 html 文件');
      return;
    }

    sessionTranscript = '';
    lastInterimTranscript = '';
    sessionHadMicAudio = false;
    sessionSpeechError = '';
    recordStartedAt = Date.now();
    recording = true;
    applyCatMood('cat-listening', els.chatCat);
    els.micBtn.classList.add('recording');
    els.recordingRings.classList.remove('hidden');
    els.chatStatus.textContent = '正在开启麦克风…';
    updateListeningVisuals(0);
    bindGlobalStopListeners();

    await primeAudio();
    if (!micReady) await initChatMic();
    if (!micReady) {
      recording = false;
      unbindGlobalStopListeners();
      resetRecordingUI();
      alert('请先允许麦克风权限，才能和小猫对话。');
      return;
    }

    startMicMonitor();
    startAudioCapture();
    els.chatStatus.textContent = '请对着麦克风说话，说完再松开…';

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      if (!startSpeechRecognition()) {
        els.chatStatus.textContent = '在线识别未启动，松开后将用本地模型识别…';
      }
    } else {
      els.chatStatus.textContent = '将用本地模型识别，请对着麦克风说话…';
    }
  }

  function stopRecording(finalize = true) {
    if (awaitingRecognition) return;
    if (!recording) return;

    if (finalize) {
      const heldMs = Date.now() - recordStartedAt;
      if (heldMs < 800) {
        els.chatStatus.textContent = '请按住久一点：先说话，再松开（至少 1 秒）';
        return;
      }
    }

    recording = false;
    resetRecordingUI();
    pendingAudioBlobPromise = stopAudioCapture();

    if (!finalize) {
      stopSpeechRecognition();
      pendingAudioBlobPromise = null;
      unbindGlobalStopListeners();
      return;
    }

    awaitingRecognition = true;
    els.chatStatus.textContent = '正在识别你说的话…';

    if (!recognition) {
      finishRecordingResponse();
      return;
    }

    clearStopDelayTimer();
    stopDelayTimer = setTimeout(() => {
      stopDelayTimer = null;
      try {
        recognition.stop();
      } catch {
        finishRecordingResponse();
        return;
      }
      clearRecognitionFinishTimer();
      recognitionFinishTimer = setTimeout(() => {
        if (awaitingRecognition) finishRecordingResponse();
      }, 4500);
    }, 650);
  }

  async function respondToVoice(text) {
    const userText = polishTranscript(text) || '（没听清楚）';
    appendChatBubble(userText, true);
    els.chatStatus.textContent = '小猫正在思考怎么回应…';

    const emotion = pickEmotionByText(userText);
    const reply = generateSmartReply(userText, emotion);
    const scenario = emotion.scenario || detectChatScenario(userText);
    writeStore(STORAGE.voiceCount, readStore(STORAGE.voiceCount, 0) + 1);
    updateStats();

    await new Promise((r) => setTimeout(r, 400));
    applyCatMood('cat-happy', els.chatCat);
    appendChatBubble(`🐱 ${reply}`);
    els.chatStatus.textContent = scenario ? scenario.caption : `${emotion.name} · ${emotion.hint}`;
    await audio.playMeow(emotion.id, 1);
    setTimeout(() => applyCatMood('', els.chatCat), 1200);
    if (scenario) {
      await new Promise((r) => setTimeout(r, 600));
      showScenarioVideo(scenario);
    }
  }

  async function preloadSpeechModel() {
    if (!window.SpeechFallback?.preload) return;
    try {
      await window.SpeechFallback.preload((status) => {
        if (document.querySelector('#screen-chat.active') && els.chatStatus) {
          els.chatStatus.textContent = status;
        }
      });
      if (!document.querySelector('#screen-chat.active') || !els.chatStatus) return;
      if (window.SpeechFallback.mode === 'local-server') {
        els.chatStatus.textContent = '本地语音服务已连接，长按麦克风说话吧～';
      } else if (window.SpeechFallback.ready) {
        els.chatStatus.textContent = '语音识别已就绪（浏览器模式），长按麦克风说话吧～';
      } else {
        els.chatStatus.textContent = '浏览器识别模型未加载，建议运行 python stt_server.py';
      }
    } catch {
      if (document.querySelector('#screen-chat.active') && els.chatStatus) {
        els.chatStatus.textContent = '语音识别未就绪。请运行 python stt_server.py';
      }
    }
  }

  async function ensureGameMic() {
    await primeAudio();
    const ok = await ensureSharedMic();
    if (ok && window.JumpGame?.setMicSource && micAnalyser && micData) {
      JumpGame.setMicSource(micAnalyser, micData);
    }
    return ok;
  }

  function setJumpMicStatus(ready) {
    if (!els.jumpStatus) return;
    els.jumpStatus.textContent = ready
      ? '麦克风已自动开启，点击「开始闯关」或发出声音即可'
      : '请允许麦克风权限，闯关需要你的声音';
  }

  async function initJumpScreen() {
    if (!window.JumpGame || !els.jumpCanvas) return;
    JumpGame.init({
      canvas: els.jumpCanvas,
      volumeFill: els.jumpVolumeFill,
      onWin: () => {
        JumpGame.stop();
        els.jumpStatusText.textContent = '通关！';
        els.jumpStatus.textContent = `太棒了，小猫吃到小鱼干啦！亲密度 +${INTIMACY_GAIN.jumpWin}`;
        els.jumpRetryBtn.classList.remove('hidden');
        showWinScreen();
      },
      onLose: () => {
        JumpGame.stop();
        addIntimacy(INTIMACY_GAIN.jumpLose);
        els.jumpStatusText.textContent = '撞到了！';
        els.jumpStatus.textContent = `再大声一点跳高一点～亲密度 +${INTIMACY_GAIN.jumpLose}，小猫仍记得你的陪伴`;
        els.jumpRetryBtn.classList.remove('hidden');
        audio.playMeow('irritable', 0);
      }
    });

    if (micReady) {
      JumpGame.setMicSource(micAnalyser, micData);
      setJumpMicStatus(true);
      return;
    }

    els.jumpStatus.textContent = '正在自动打开麦克风…';
    const ok = await ensureGameMic();
    setJumpMicStatus(ok);
  }

  async function startJumpGame() {
    hideWinScreen();
    els.jumpStatus.textContent = '正在自动打开麦克风…';
    if (els.jumpStartBtn) els.jumpStartBtn.disabled = true;
    const ok = await ensureGameMic();
    if (els.jumpStartBtn) els.jumpStartBtn.disabled = false;
    if (!ok) {
      setJumpMicStatus(false);
      alert('请在浏览器弹窗中允许麦克风，才能开始闯关');
      return;
    }
    JumpGame.setMicSource(micAnalyser, micData);
    els.jumpRetryBtn.classList.add('hidden');
    els.jumpStatusText.textContent = '闯关进行中…';
    els.jumpStatus.textContent = '麦克风已开启！发出声音，声音越大跳得越高';
    JumpGame.reset();
    JumpGame.start();
  }

  function bindUI() {
    setPageBackground('intro');

    els.enterBtn.addEventListener('click', async () => {
      await requestIntroMic();
      await primeAudio();
      await playMeowFeedback();
      document.body.classList.remove('intro-active');
      els.introOverlay.classList.add('hidden');
      playBgm();
      showScreen('home');
    });

    if (els.introMicBtn) {
      els.introMicBtn.addEventListener('click', () => {
        void requestIntroMic();
      });
    }

    els.navCards.forEach((card) => card.addEventListener('click', async () => {
      const target = card.dataset.target;
      if (target === 'jump' || target === 'chat') await ensureSharedMic();
      showScreen(target);
    }));
    els.backBtns.forEach((btn) => btn.addEventListener('click', () => showScreen(btn.dataset.target)));

    els.micBtn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startRecording();
    });
    els.micBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startRecording();
    }, { passive: false });

    if (els.jumpStartBtn) els.jumpStartBtn.addEventListener('click', startJumpGame);
    if (els.jumpRetryBtn) els.jumpRetryBtn.addEventListener('click', startJumpGame);
    if (els.winRetryBtn) els.winRetryBtn.addEventListener('click', () => { hideWinScreen(); startJumpGame(); });
    if (els.winHomeBtn) els.winHomeBtn.addEventListener('click', () => { hideWinScreen(); JumpGame.stop(); showScreen('home'); });

    if (els.videoClose) els.videoClose.addEventListener('click', closeScenarioVideo);
    if (els.videoOverlay) {
      els.videoOverlay.addEventListener('click', (e) => {
        if (e.target === els.videoOverlay) closeScenarioVideo();
      });
    }
    if (els.sceneVideo) els.sceneVideo.addEventListener('ended', closeScenarioVideo);
  }

  function init() {
    bindUI();
    updateStats();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
