@echo off
echo ================================================
echo   CoreVisitor Kiosk - Android Production Build
echo ================================================
echo.

echo [1/5] Pulizia build precedente...
if exist build rmdir /s /q build
if exist android rmdir /s /q android
echo     Completato!
echo.

echo [2/5] Installazione dipendenze...
call npm install
echo     Completato!
echo.

echo [3/5] Build React production...
call npm run build
if errorlevel 1 (
    echo     ERRORE: Build React fallita!
    pause
    exit /b 1
)
echo     Completato!
echo.

echo [4/5] Inizializzazione Capacitor Android...
call npx cap add android
echo     Completato!
echo.

echo [5/5] Sincronizzazione con Capacitor...
call npx cap sync android
if errorlevel 1 (
    echo     ERRORE: Sync Capacitor fallita!
    pause
    exit /b 1
)
echo     Completato!
echo.

echo ================================================
echo   Build completata con successo!
echo ================================================
echo.
echo Prossimo passo:
echo 1. Apri Android Studio con: npx cap open android
echo 2. Build -> Generate Signed Bundle / APK
echo 3. Seleziona APK e segui il wizard
echo.
pause
