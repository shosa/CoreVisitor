@echo off
echo ================================================
echo   CoreVisitor Kiosk - Development Mode
echo ================================================
echo.

REM Rileva IP del PC automaticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set IP=%%a
set IP=%IP: =%

if "%IP%"=="" (
    set IP=192.168.1.100
    echo ATTENZIONE: IP non rilevato, usando fallback: %IP%
) else (
    echo IP rilevato: %IP%
)

echo.
echo Il server React partira' su: http://%IP%:3000
echo.
echo IMPORTANTE:
echo 1. Assicurati che il PC e il tablet siano sulla stessa rete
echo 2. Controlla che il firewall non blocchi la porta 3000
echo.
pause

echo.
echo [1/3] Avvio React Dev Server...
start "React Dev Server" cmd /k "set REACT_APP_SERVER_IP=%IP% && npm start"

echo.
echo [2/3] Attendi 15 secondi per l'avvio del server...
timeout /t 15

echo.
echo [3/3] Sincronizzazione con Capacitor...
call npx cap sync android

echo.
echo ================================================
echo   Setup completato!
echo ================================================
echo.
echo Prossimi passi:
echo 1. Apri Android Studio: npx cap open android
echo 2. Connetti il tablet Android via USB
echo 3. Clicca Run (freccia verde)
echo 4. L'app si connette al dev server per live reload
echo.
echo Server React: http://%IP%:3000
echo.
pause
