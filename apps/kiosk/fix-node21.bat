@echo off
echo ================================================
echo   CoreVisitor Kiosk - Fix per Node.js 21
echo ================================================
echo.

echo [1/3] Pulizia completa...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
echo     Completato!
echo.

echo [2/3] Reinstallazione dipendenze...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo     ERRORE durante npm install!
    pause
    exit /b 1
)
echo     Completato!
echo.

echo [3/3] Verifica installazione...
echo Checking node_modules...
if not exist node_modules\ipaddr.js (
    echo ERRORE: ipaddr.js mancante!
    pause
    exit /b 1
)
echo     Tutti i moduli OK!
echo.

echo ================================================
echo   Setup completato con successo!
echo ================================================
echo.
echo Ora puoi avviare l'app con: npm start
echo.
pause
