$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8081/')
$listener.Start()
Write-Host 'Server started at http://localhost:8081/'
Write-Host 'Press Ctrl+C to stop'

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $path = $request.Url.LocalPath
    if ($path -eq '/') {
        $path = '/index.html'
    }
    
    $filePath = Join-Path $PWD $path.TrimStart('/')
    
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $extension = [System.IO.Path]::GetExtension($filePath)
        switch ($extension) {
            '.html' { $response.ContentType = 'text/html; charset=utf-8' }
            '.css' { $response.ContentType = 'text/css; charset=utf-8' }
            '.js' { $response.ContentType = 'application/javascript; charset=utf-8' }
            default { $response.ContentType = 'text/plain; charset=utf-8' }
        }
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $message = [System.Text.Encoding]::UTF8.GetBytes('Not Found')
        $response.ContentLength64 = $message.Length
        $response.OutputStream.Write($message, 0, $message.Length)
    }
    
    $response.Close()
}
