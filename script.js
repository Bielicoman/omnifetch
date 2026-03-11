
const codes = {
    setup: `@echo off\nchcp 65001 >nul\ntitle OmniFetch Instalador\ncolor 0B\n\n:: --- AUTO-ELEVACAO BLINDADA ---\nnet session >nul 2>&1\nif %errorLevel% neq 0 (\n    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\\getadmin.vbs"\n    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\\getadmin.vbs"\n    "%temp%\\getadmin.vbs"\n    del "%temp%\\getadmin.vbs"\n    exit /B\n)\ncd /d "%~dp0"\n\ncls\necho.\necho  =======================================\necho  ✨ BEM-VINDO AO INSTALADOR OMNIFETCH! ✨\necho  =======================================\necho.\necho  Verificando Python...\nwinget install Python.Python.3.12 --silent --accept-package-agreements --accept-source-agreements\npip install yt-dlp mutagen --quiet --upgrade\necho  Instalando FFmpeg...\nwinget install Gyan.FFmpeg --silent\necho  Instalando Calibre...\nwinget install calibre.calibre --silent\n\necho  🎉 OMNIFETCH CONFIGURADO COM SUCESSO! 🎉\npause\nexit`,

    downloader: `@echo off\nsetlocal enabledelayedexpansion\nchcp 65001 >nul\ntitle OmniFetch Baixador Ultimate\ncolor 0A\n\n:inicio\ncls\necho  ======================================================\necho  ✨ OMNIFETCH BAIXADOR ULTIMATE - ARSENAL 100 ✨\necho  ======================================================\n\nset /p LINK=Cole o link aqui: \nif not defined LINK goto inicio\n\nset "PASTA=%USERPROFILE%\\Downloads"\nset /p PASTA=Caminho da pasta (vazio para Downloads): \n\n:: Download Video Alta Resolucao (MP4)\nyt-dlp --embed-metadata --embed-thumbnail -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" -o "%PASTA%\\%%(title)s.%%(ext)s" "%LINK%"\n\necho  CONCLUIDO!\npause\ngoto inicio`,

    conversor: `@echo off\nsetlocal enabledelayedexpansion\nchcp 65001 >nul\ntitle OmniFetch - Conversor Universal\ncolor 0E\n\n:inicio\ncls\necho  ======================================================\necho  ✨ OMNIFETCH ULTIMATE - MOTOR DE CONVERSAO ✨\necho  ======================================================\n\nset /p ARQUIVO=Caminho completo do arquivo: \nif not exist "%ARQUIVO%" goto inicio\n\n:: Menu de formatos\necho [1] MP4\necho [2] MP3\necho [3] PDF\nset /p OPCAO=Opcao: \n\nset "PASTA=%USERPROFILE%\\Downloads"\n\nif "%OPCAO%"=="1" ffmpeg -i "%ARQUIVO%" -c:v libx264 -crf 18 "%PASTA%\\output.mp4"\nif "%OPCAO%"=="2" ffmpeg -i "%ARQUIVO%" -vn -ab 320k "%PASTA%\\output.mp3"\nif "%OPCAO%"=="3" ebook-convert "%ARQUIVO%" "%PASTA%\\output.pdf"\n\necho  CONVERSAO CONCLUIDA!\npause\ngoto inicio`
};

function viewCode(type) {
    const viewer = document.getElementById('code-section');
    const display = document.getElementById('code-content');
    const title = document.getElementById('code-title');

    title.innerText = 'Código Fonte: ' + type.toUpperCase() + '.bat';
    display.innerText = codes[type];
    viewer.classList.remove('hidden');
    viewer.classList.add('visible');
    
    // Smooth scroll to code view
    viewer.scrollIntoView({ behavior: 'smooth' });
}

function closeCode() {
    const viewer = document.getElementById('code-section');
    viewer.classList.add('hidden');
    viewer.classList.remove('visible');
}

function copyCode() {
    const content = document.getElementById('code-content').innerText;
    navigator.clipboard.writeText(content).then(() => {
        alert('Código copiado para a área de transferência!');
    });
}
