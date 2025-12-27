@echo off
echo ========================================
echo   OPEX Manager - Docker Stop
echo ========================================
echo.

echo Stopping all containers...
docker-compose -f docker-compose.dev.yml down

echo.
echo Do you want to remove volumes (database data)? (y/N)
set /p remove_volumes=
if /i "%remove_volumes%"=="y" (
    echo Removing volumes...
    docker-compose -f docker-compose.dev.yml down -v
    echo All data has been removed.
) else (
    echo Volumes preserved. Data will be available on next start.
)

echo.
echo All services stopped.
pause
