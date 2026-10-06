# Vite on Windows, so the dev server reads this repo from NTFS.
# Rails in Docker points the browser at http://host.docker.internal:3036.
$ErrorActionPreference = "Stop"
Set-Location (Resolve-Path (Join-Path $PSScriptRoot ".."))
$env:VITE_RUBY_HOST = "0.0.0.0"
$env:VITE_RUBY_PORT = "3036"
$env:HUSKY = "0"
pnpm exec vite --host 0.0.0.0 --port 3036 --strictPort
