#!/usr/bin/env python3
import sys
import subprocess
import importlib
import platform
import json


def ensure(package, import_name=None):
    name = import_name or package
    try:
        importlib.import_module(name)
    except ImportError:
        print(f"Installing {package}...", file=sys.stderr, flush=True)
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package, "-q"],
            stdout=sys.stderr,
        )


def is_apple_silicon():
    return platform.system() == "Darwin" and platform.machine() == "arm64"


def transcribe_mlx(file_path):
    ensure("mlx-whisper", "mlx_whisper")
    import mlx_whisper
    result = mlx_whisper.transcribe(
        file_path, path_or_hf_repo="mlx-community/whisper-small-mlx"
    )
    return result["text"].strip()


def transcribe_faster(file_path):
    ensure("faster-whisper", "faster_whisper")
    from faster_whisper import WhisperModel
    import ctranslate2

    device, compute_type = "cpu", "int8"
    try:
        if ctranslate2.get_cuda_device_count() > 0:
            device, compute_type = "cuda", "float16"
    except Exception:
        pass

    model = WhisperModel("small", device=device, compute_type=compute_type)
    segments, _ = model.transcribe(file_path)
    return "".join(seg.text for seg in segments).strip()


def transcribe(file_path):
    if is_apple_silicon():
        return transcribe_mlx(file_path)
    return transcribe_faster(file_path)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    try:
        text = transcribe(sys.argv[1])
        print(json.dumps({"transcription": text}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
