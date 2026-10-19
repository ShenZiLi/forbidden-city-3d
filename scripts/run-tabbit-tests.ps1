param([ValidatePattern('^[a-z0-9-]+$')][string]$TaskName='forbidden-city-checks',[ValidatePattern('^[0-9]*$')][string]$TabId='',[ValidateSet('Checks','Performance')][string]$Mode='Checks')
$ErrorActionPreference='Stop'
$launcher=Join-Path $env:LOCALAPPDATA 'Tabbit/LocalAgent/bin/tabbit-cli.exe'
if(-not(Test-Path -LiteralPath $launcher)){throw 'Tabbit launcher not installed; use npm run test:e2e with a local Playwright browser.'}
$moduleFile=if($Mode -eq 'Performance'){'performance.mjs'}else{'checks.mjs'}
$method=if($Mode -eq 'Performance'){'measurePerformance(page)'}else{'runBrowserChecks(page,expect)'}
$modulePath=(Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "../tests/browser/$moduleFile")).Path
$moduleUrl=(([uri]$modulePath).AbsoluteUri+'?revision='+[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()) | ConvertTo-Json -Compress
$program=Join-Path ([IO.Path]::GetTempPath()) ('city-checks-'+[guid]::NewGuid().ToString('N')+'.js')
try{
  [IO.File]::WriteAllText($program,"const {runBrowserChecks,measurePerformance}=await import($moduleUrl);return await $method;",[Text.UTF8Encoding]::new($false))
  $target=if($TabId){" --tab $TabId"}else{''}
  $line="`"$launcher`" nodejs --task $TaskName$target --request-id checks-$([DateTimeOffset]::UtcNow.ToUnixTimeSeconds()) --timeout-ms 180000 < `"$program`""
  $output=cmd.exe /d /c $line
  $output | Write-Output
  $jsonLine=$output|Where-Object {$_.StartsWith('{')}|Select-Object -Last 1
  $parsed=$jsonLine|ConvertFrom-Json
  $report=if($Mode -eq 'Performance'){'performance-results.json'}else{'browser-results.json'}
  if($parsed.result.value){$parsed.result.value|ConvertTo-Json -Depth 12|Set-Content (Join-Path $PSScriptRoot "../docs/$report") -Encoding utf8}
  if($LASTEXITCODE -ne 0 -or $parsed.status -ne 'succeeded'){exit 1}
  if($Mode -eq 'Checks' -and @($parsed.result.value.results|Where-Object {-not $_.passed}).Count){exit 1}
}finally{Remove-Item -LiteralPath $program -ErrorAction SilentlyContinue}
