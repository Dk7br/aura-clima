@echo off
title Enviar Aura Clima para o GitHub
cd /d "%~dp0"
set PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%
echo ========================================================
echo   Enviando arquivos do Aura Clima para o seu GitHub...
echo   (Uma janela do navegador pode se abrir para autorizar)
echo ========================================================
git push -u origin main
echo.
echo ========================================================
echo   Processo finalizado!
echo ========================================================
pause
