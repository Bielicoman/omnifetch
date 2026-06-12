' OMNIFETCH - inicia o app SEM janela preta.
' O navegador abre sozinho. Para encerrar: botao "Encerrar" nas configuracoes do app.
' Se nada abrir em ~1 minuto (primeira vez), rode "Iniciar OMNIFETCH.bat" para ver o que falta.

Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)

Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = dir

If Not fso.FolderExists(dir & "\node_modules") Or Not fso.FileExists(dir & "\server\dist\index.js") Then
  ' Primeira execucao: precisa instalar/compilar - abre o modo visivel
  sh.Run """" & dir & "\Iniciar OMNIFETCH.bat""", 1, False
Else
  sh.Run "cmd /c cd /d """ & dir & """ && npm start", 0, False
End If
