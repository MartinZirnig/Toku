@echo off
call :back_run


cd..
cd..
cd..
cd WebFrontend
cd Toku_frontend
call :install_npm
call :run_ng



:back_run
    cd Backend
    cd Backend
    dotnet clean
    dotnet build
    cd Backend
    start dotnet run

:install_npm
    npm install
    exit

:run_ng
    start ng serve
    exit