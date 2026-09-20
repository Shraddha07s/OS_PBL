@echo off
REM ============================================================
REM  Member 1 Core Simulation - Build and Run Tests
REM ============================================================

echo [1/3] Creating output directories...
if not exist "out\production" mkdir "out\production"
if not exist "out\test" mkdir "out\test"

echo [2/3] Compiling Java source files...
dir /s /b src\main\java\*.java > sources_main.txt
javac -d out\production @sources_main.txt
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed for main sources!
    del sources_main.txt
    exit /b 1
)
del sources_main.txt

dir /s /b src\test\java\*.java > sources_test.txt
javac -cp "out\production" -d out\test @sources_test.txt
if %ERRORLEVEL% NEQ 0 (
    echo Compilation failed for test sources!
    del sources_test.txt
    exit /b 1
)
del sources_test.txt

echo [3/3] Running Member 1 Test Suite...
java -cp "out\production;out\test" simulator.TestRunner
exit /b %ERRORLEVEL%
