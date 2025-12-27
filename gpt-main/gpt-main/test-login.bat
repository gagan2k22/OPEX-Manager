@echo off
echo ========================================
echo   OPEX Manager - Quick Test
echo ========================================
echo.

echo Testing server health...
curl -s http://localhost:5000/health
echo.
echo.

echo Testing login endpoint...
echo Request: POST /api/auth/login
echo Body: {"email":"admin@example.com","password":"password123"}
echo.

curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@example.com\",\"password\":\"password123\"}"

echo.
echo.
echo ========================================
echo Test complete!
echo ========================================
pause
