$files = @(
    "d:\CITIBANK\app\recruiter\jobs\page.js",
    "d:\CITIBANK\app\recruiter\jobs\new\page.js",
    "d:\CITIBANK\app\recruiter\candidates\page.js",
    "d:\CITIBANK\app\recruiter\shortlist\page.js",
    "d:\CITIBANK\app\recruiter\analytics\page.js"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        
        # Clean up text gradients and colored text
        $c = $c -replace 'text-transparent bg-clip-text bg-gradient-to-r [a-zA-Z0-9-\[\]]+ [a-zA-Z0-9-\[\]]+', 'text-white'
        $c = $c -replace 'text-blue-\d+', 'text-gray-300'
        $c = $c -replace 'text-purple-\d+', 'text-gray-300'
        $c = $c -replace 'text-cyan-\d+', 'text-gray-300'
        $c = $c -replace 'text-indigo-\d+', 'text-gray-300'
        $c = $c -replace 'text-green-\d+', 'text-green-400'
        
        # Clean up borders
        $c = $c -replace 'border-white/60', 'border-white/5'
        $c = $c -replace 'border-purple-\d+', 'border-white/10'
        $c = $c -replace 'border-blue-\d+', 'border-white/10'
        $c = $c -replace 'border-cyan-\d+', 'border-white/10'
        $c = $c -replace 'border-indigo-\d+', 'border-white/10'
        $c = $c -replace 'border-green-\d+', 'border-white/10'
        
        # Clean up backgrounds
        $c = $c -replace 'bg-blue-\d+', 'bg-white/5'
        $c = $c -replace 'bg-purple-\d+', 'bg-white/5'
        $c = $c -replace 'bg-cyan-\d+', 'bg-white/5'
        $c = $c -replace 'bg-indigo-\d+', 'bg-white/5'
        
        # Fix margin for sidebar consistency
        $c = $c -replace 'ml-64', 'ml-[260px]'
        
        Set-Content $f $c -NoNewline
        Write-Output "Cleaned colors: $f"
    }
}
