@echo off
setlocal
title Nec Model Cache Installer

rem ================================================================
rem  Nec crack package - ONNX model cache installer
rem
rem  What this does
rem    Copies the 7 ONNX model caches shipped inside this package
rem    into the Nec client cache folder:
rem        %USERPROFILE%\Documents\
rem    File names : 1.txt 2.txt 3.txt 13.txt 6.txt 21.txt 5.txt
rem
rem  How the source folder is found
rem    The cache subfolder that sits next to this script is located
rem    automatically (it is the one that holds the cache files), so
rem    this .bat stays pure ASCII and prints right on any code page.
rem
rem  Usage : double click this file, or run it from a console.
rem
rem  Notes : %~dp0 is the folder this .bat lives in (with trailing \).
rem ================================================================

set "DOCS=%USERPROFILE%\Documents"
set "CACHE="

for /d %%D in ("%~dp0*") do (
  for %%N in (1.txt 2.txt 3.txt 13.txt 6.txt 21.txt 5.txt) do (
    if exist "%%~fD\%%N" set "CACHE=%%~fD"
  )
)

echo ================================================================
echo  Nec model cache installer
echo ================================================================
echo  source folder : %CACHE%
echo  target folder : %DOCS%
echo.

if not defined CACHE (
  echo [FAIL] model cache subfolder not found next to this script.
  echo        Looked for a subfolder holding 1.txt / 2.txt / 3.txt /
  echo        13.txt / 6.txt / 21.txt / 5.txt and found none.
  echo        Run the model downloader script first.
  goto :finish
)

if not exist "%DOCS%\" (
  echo [INFO] target folder does not exist, creating it ...
  md "%DOCS%" 2>nul
  if not exist "%DOCS%\" (
    echo [FAIL] cannot create "%DOCS%"
    goto :finish
  )
)

set /a OK=0
set /a MISS=0
set /a FAIL=0

if exist "%CACHE%\1.txt" (
  copy /Y "%CACHE%\1.txt" "%DOCS%\1.txt" >nul
  if exist "%DOCS%\1.txt" ( echo [OK]   1.txt  PUBG & set /a OK+=1 ) else ( echo [FAIL] 1.txt  PUBG & set /a FAIL+=1 )
) else (
  echo [MISS] 1.txt  PUBG & set /a MISS+=1
)

if exist "%CACHE%\2.txt" (
  copy /Y "%CACHE%\2.txt" "%DOCS%\2.txt" >nul
  if exist "%DOCS%\2.txt" ( echo [OK]   2.txt  COD & set /a OK+=1 ) else ( echo [FAIL] 2.txt  COD & set /a FAIL+=1 )
) else (
  echo [MISS] 2.txt  COD & set /a MISS+=1
)

if exist "%CACHE%\3.txt" (
  copy /Y "%CACHE%\3.txt" "%DOCS%\3.txt" >nul
  if exist "%DOCS%\3.txt" ( echo [OK]   3.txt  OW & set /a OK+=1 ) else ( echo [FAIL] 3.txt  OW & set /a FAIL+=1 )
) else (
  echo [MISS] 3.txt  OW & set /a MISS+=1
)

if exist "%CACHE%\13.txt" (
  copy /Y "%CACHE%\13.txt" "%DOCS%\13.txt" >nul
  if exist "%DOCS%\13.txt" ( echo [OK]   13.txt R6 & set /a OK+=1 ) else ( echo [FAIL] 13.txt R6 & set /a FAIL+=1 )
) else (
  echo [MISS] 13.txt R6 & set /a MISS+=1
)

if exist "%CACHE%\6.txt" (
  copy /Y "%CACHE%\6.txt" "%DOCS%\6.txt" >nul
  if exist "%DOCS%\6.txt" ( echo [OK]   6.txt  Thefinals & set /a OK+=1 ) else ( echo [FAIL] 6.txt  Thefinals & set /a FAIL+=1 )
) else (
  echo [MISS] 6.txt  Thefinals & set /a MISS+=1
)

if exist "%CACHE%\21.txt" (
  copy /Y "%CACHE%\21.txt" "%DOCS%\21.txt" >nul
  if exist "%DOCS%\21.txt" ( echo [OK]   21.txt Rust & set /a OK+=1 ) else ( echo [FAIL] 21.txt Rust & set /a FAIL+=1 )
) else (
  echo [MISS] 21.txt Rust & set /a MISS+=1
)

if exist "%CACHE%\5.txt" (
  copy /Y "%CACHE%\5.txt" "%DOCS%\5.txt" >nul
  if exist "%DOCS%\5.txt" ( echo [OK]   5.txt  CSGO & set /a OK+=1 ) else ( echo [FAIL] 5.txt  CSGO & set /a FAIL+=1 )
) else (
  echo [MISS] 5.txt  CSGO & set /a MISS+=1
)

echo.
echo ================================================================
echo  result : copied %OK%   missing %MISS%   failed %FAIL%
echo ================================================================
if not "%MISS%"=="0" echo  Tip: files marked [MISS] are not in the package yet.
if not "%MISS%"=="0" echo       Run the model downloader script, then run this again.
if not "%FAIL%"=="0" echo  Tip: files marked [FAIL] could not be copied.
if "%OK%"=="7" echo  All 7 model caches are now in %DOCS%
echo.

:finish
echo Press any key to close this window ...
pause >nul
endlocal
