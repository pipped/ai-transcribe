#!/usr/bin/env python3
import sys
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
