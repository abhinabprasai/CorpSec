# CorpSec static dev server — no installs, uses .NET HttpListener.
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
# Stop: press Ctrl+C in this window.

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

$mime = @{
  ".html"="text/html; charset=utf-8"; ".htm"="text/html; charset=utf-8";
  ".css"="text/css; charset=utf-8";   ".js"="application/javascript; charset=utf-8";
  ".json"="application/json; charset=utf-8"; ".svg"="image/svg+xml";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".gif"="image/gif";
  ".ico"="image/x-icon"; ".woff"="font/woff"; ".woff2"="font/woff2"; ".map"="application/json"
}

# find a free port 5173..5192 (8080 is excluded by Windows on this machine)
$listener = $null
$port = $null
foreach ($p in 5173..5192) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    $l.Start()
    $listener = $l; $port = $p; break
  } catch { if ($l) { $l.Close() } }
}
if (-not $listener) { Write-Host "Could not bind a port in 8080-8099." -ForegroundColor Red; exit 1 }

$url = "http://localhost:$port/"
Write-Host ""
Write-Host "  CorpSec is live at  $url" -ForegroundColor Green
Write-Host "  Serving:            $root"
Write-Host "  Press Ctrl+C to stop."
Write-Host ""
try { Start-Process $url | Out-Null } catch {}

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $rel = [System.Uri]::UnescapeDataString($req.Url.LocalPath)
      if ($rel -eq "/" -or $rel -eq "") { $rel = "/index.html" }
      $full = Join-Path $root ($rel.TrimStart("/") -replace "/","\")
      $fullResolved = [System.IO.Path]::GetFullPath($full)
      if (-not $fullResolved.StartsWith([System.IO.Path]::GetFullPath($root))) {
        $res.StatusCode = 403; $res.Close(); continue
      }
      if (Test-Path $fullResolved -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($fullResolved)
        $ext = [System.IO.Path]::GetExtension($fullResolved).ToLower()
        $res.ContentType = $(if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" })
        $res.Headers.Add("Cache-Control","no-cache")
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host ("  200  " + $rel)
      } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - $rel not found")
        $res.OutputStream.Write($msg, 0, $msg.Length)
        Write-Host ("  404  " + $rel) -ForegroundColor DarkYellow
      }
    } catch {
      try { $res.StatusCode = 500 } catch {}
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  $listener.Stop(); $listener.Close()
}
