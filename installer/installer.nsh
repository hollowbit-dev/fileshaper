; Adds "Open with Filesmith" to the right-click menu for every file (per user, no admin needed),
; and removes it again on uninstall. On Windows 11 it's under "Show more options".
!macro customInstall
  WriteRegStr HKCU "Software\Classes\*\shell\Filesmith" "" "Open with Filesmith"
  WriteRegStr HKCU "Software\Classes\*\shell\Filesmith" "Icon" "$INSTDIR\Filesmith.exe,0"
  WriteRegStr HKCU "Software\Classes\*\shell\Filesmith" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\*\shell\Filesmith\command" "" '"$INSTDIR\Filesmith.exe" "%1"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\*\shell\Filesmith"
!macroend
