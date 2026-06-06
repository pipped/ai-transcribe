#!/usr/bin/env python3
import sys
import subprocess
import importlib

def ensure(package, import_name=None):
    name = import_name or package
    try:
        importlib.import_module(name)
    except ImportError:
        print(f"Installing {package}...", file=sys.stderr, flush=True)
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", package, "-q"],
            stdout=sys.stderr
        )

ensure("mlx-whisper", "mlx_whisper")

import json
import mlx_whisper

def transcribe(file_path, model="mlx-community/whisper-small-mlx"):
    result = mlx_whisper.transcribe(file_path, path_or_hf_repo=model)
    transcription = result["text"].strip()
    print(json.dumps({"transcription": transcription}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    transcribe(sys.argv[1])
