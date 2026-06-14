@echo off
title CorpSec dev server
echo Starting CorpSec...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
pause
