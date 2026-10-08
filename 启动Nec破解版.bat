@echo off
chcp 65001 >nul
setlocal
title Nec Crack Launcher - QQ Group 777410175
color 0A
rem ============================================================
rem  Nec crack launcher (double-click to run)
rem   - starts the bundled client Nec\kwmusic.exe with its dir as cwd
rem   - applies runtime memory patches to AudioBuffer.dll in KwService.exe
rem   - fills the card field, clicks login, closes the result popup
rem  Runtime: uses the bundled Python in <this dir>\<runtime dir>\Python\
rem           (falls back to system "py -3" if the bundled one is missing)
rem
rem  NOTE: keep this file pure ASCII. cmd.exe mis-parses Chinese text in
rem  batch files under chcp 65001; all Chinese messages are printed by
rem  launch.py instead.
rem ============================================================
echo.
echo   ==============================================================
echo     N E C   C R A C K   -   O N E   C L I C K   S T A R T
echo   --------------------------------------------------------------
echo     Crack community QQ group :  777410175
echo   ==============================================================
echo.

set "PYCMD="
for /d %%D in ("%~dp0*") do if exist "%%~fD\Python\python.exe" set PYCMD="%%~fD\Python\python.exe"
if not defined PYCMD set "PYCMD=py -3"
call %PYCMD% "%~dp0launch.py" %*
set RC=%ERRORLEVEL%

echo.
if "%RC%"=="0" (
  echo   [OK] done - the client is running with the crack applied.
  echo        See the messages above: this window can be closed now.
  echo        QQ group: 777410175
) else (
  echo   [FAIL] exit code = %RC%
  echo          Keep this window, screenshot the errors above,
  echo          and send them to QQ group: 777410175
)
echo.
echo   Press any key to close this window ...
pause >nul
endlocal
