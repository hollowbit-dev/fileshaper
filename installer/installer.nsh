; Adds "Open with Fileshaper" to the right-click menu for every file (per user, no admin needed),
; and removes it again on uninstall. On Windows 11 it's under "Show more options".
!macro customInstall
  DeleteRegKey HKCU "Software\Classes\*\shell\Filesmith"
  WriteRegStr HKCU "Software\Classes\*\shell\Fileshaper" "" "Open with Fileshaper"
  WriteRegStr HKCU "Software\Classes\*\shell\Fileshaper" "Icon" "$INSTDIR\Fileshaper.exe,0"
  WriteRegStr HKCU "Software\Classes\*\shell\Fileshaper" "MultiSelectModel" "Player"
  WriteRegStr HKCU "Software\Classes\*\shell\Fileshaper\command" "" '"$INSTDIR\Fileshaper.exe" "%1"'
!macroend

!macro customUnInstall
  DeleteRegKey HKCU "Software\Classes\*\shell\Fileshaper"
!macroend
