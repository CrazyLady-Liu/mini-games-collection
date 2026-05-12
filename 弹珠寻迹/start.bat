@echo off
echo Starting Pinball Trace game...
echo.
echo Please open index.html in your browser directly, or use a local web server.
echo.
echo If you have Python installed, you can run:
echo   python -m http.server 8080
echo Then open http://localhost:8080 in your browser.
echo.
timeout /t 3 >nul
start index.html
