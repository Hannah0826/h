#!/usr/bin/env python3
"""本地语音识别服务（推荐在国内使用，识别更准确）

安装:
  pip install faster-whisper

另需 ffmpeg（用于解析 webm 录音）:
  Windows 可从 https://ffmpeg.org 下载并加入 PATH

用法:
  1. 另开一个终端运行: python stt_server.py
  2. 再运行网页: python -m http.server 8765
  3. 浏览器打开 http://localhost:8765 使用语音对话

可选环境变量:
  WHISPER_MODEL=small   # tiny / base / small / medium，默认 small
"""

from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
import json
import os
import tempfile

PORT = 8766
MODEL_SIZE = os.environ.get('WHISPER_MODEL', 'small')
STT_PROMPT = '小橘、小猫、喵、你好、小鱼干、出去玩、摸头、抚摸、聊天、闯关、贴贴、撸猫'
_model = None


def get_model():
    global _model
    if _model is not None:
        return _model
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise RuntimeError('请先安装: pip install faster-whisper') from exc
    print(f'正在加载 Whisper 模型 {MODEL_SIZE}（首次可能较慢）…')
    _model = WhisperModel(MODEL_SIZE, device='cpu', compute_type='int8')
    print('模型已就绪')
    return _model


class STTHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f'[STT] {args[0]}')

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path != '/health':
            self.send_error(404)
            return
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps({'ok': True, 'model': MODEL_SIZE}, ensure_ascii=False).encode('utf-8'))

    def do_POST(self):
        if self.path != '/transcribe':
            self.send_error(404)
            return

        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        ctype = self.headers.get('Content-Type', 'audio/webm')
        ext = '.webm' if 'webm' in ctype else '.wav'
        path = None

        try:
            model = get_model()
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                tmp.write(body)
                path = tmp.name
            segments, _info = model.transcribe(
                path,
                language='zh',
                beam_size=5,
                best_of=5,
                vad_filter=True,
                condition_on_previous_text=False,
                initial_prompt=STT_PROMPT,
                temperature=0.0,
            )
            text = ''.join(segment.text for segment in segments).strip()
            payload = {'text': text}
            status = 200
        except Exception as exc:
            payload = {'text': '', 'error': str(exc)}
            status = 500
        finally:
            if path and os.path.exists(path):
                os.unlink(path)

        self.send_response(status)
        self._cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.end_headers()
        self.wfile.write(json.dumps(payload, ensure_ascii=False).encode('utf-8'))


def main():
    print(f'本地语音识别服务: http://127.0.0.1:{PORT}')
    print(f'当前模型: {MODEL_SIZE}（更准但更慢，可设 WHISPER_MODEL=tiny 加速）')
    print('保持此窗口运行，然后在浏览器中使用语音对话')
    server = ThreadingHTTPServer(('127.0.0.1', PORT), STTHandler)
    server.serve_forever()


if __name__ == '__main__':
    main()
