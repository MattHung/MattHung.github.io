echo on

set YEAR=%date:~0,4%
set MONTH=%date:~5,2%
set DAY=%date:~8,2%
set HOUR=%time:~0,2%
set MINUTE=%time:~3,2%
set SECOND=%time:~6,2%
set FolderPath=backup

set PATH=%YEAR%%MONTH%%DAY%%HOUR%%MINUTE%%SECOND%

C:\Windows\System32\XCOPY.EXE Button_Disable-copy.png Button_Disable.png /D /Y 

