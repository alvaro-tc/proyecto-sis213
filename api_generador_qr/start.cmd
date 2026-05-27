@echo off
setlocal
chcp 65001 > nul

echo ============================================================
echo   api_generador_qr  --  Orquestador de QR
echo ============================================================
echo.

cd /d "%~dp0"

:: --- Resolver interprete Python ---
set PYTHON_CMD=python

if exist ".venv\Scripts\activate.bat" (
  call ".venv\Scripts\activate.bat"
  echo [OK] Venv activado.
) else (
  echo [WARN] No se encontro .venv. Buscando Python 3.12...
  set PY312=C:\Users\alvar\AppData\Local\Programs\Python\Python312\python.exe
  if exist "%PY312%" (
    set PYTHON_CMD=%PY312%
    echo [OK] Usando %PY312%
  ) else (
    echo [WARN] Python 3.12 no encontrado. Usando 'python' del PATH.
    echo [HINT] Para crear venv: py -3.12 -m venv .venv
  )
)

if not exist ".env" (
  echo [INFO] No hay .env, copiando .env.example
  copy ".env.example" ".env" > nul
)

%PYTHON_CMD% manage.py migrate --run-syncdb
echo.
echo [INFO] Iniciando Django en puerto definido por DJANGO_PORT (default 8500)
echo [INFO] Recuerda correr en otra terminal: python manage.py sync_payments
echo.

for /f "tokens=2 delims==" %%A in ('findstr /b "DJANGO_PORT=" .env 2^>nul') do set DJANGO_PORT=%%A
if "%DJANGO_PORT%"=="" set DJANGO_PORT=8500
for /f "tokens=2 delims==" %%A in ('findstr /b "DJANGO_HOST=" .env 2^>nul') do set DJANGO_HOST=%%A
if "%DJANGO_HOST%"=="" set DJANGO_HOST=0.0.0.0

%PYTHON_CMD% manage.py runserver %DJANGO_HOST%:%DJANGO_PORT%
