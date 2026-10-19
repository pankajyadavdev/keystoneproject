@echo off
setlocal

for %%I in ("%~dp0.") do set "MAVEN_PROJECTBASEDIR=%%~fI"
if not "%MAVEN_PROJECTBASEDIR%"=="" cd /d "%MAVEN_PROJECTBASEDIR%"

if defined JAVA_HOME (
  set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVA_EXE=java.exe"
)

if not exist "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
  echo Maven Wrapper JAR not found: %MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar
  exit /b 1
)

"%JAVA_EXE%" %MAVEN_OPTS% -classpath "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
exit /b %ERRORLEVEL%
