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
        
        # 1. Backgrounds first
        $c = $c -replace 'bg-white(?!\/)', 'bg-white/[0.02]'
        $c = $c -replace 'bg-gray-50/70', 'bg-white/[0.02]'
        $c = $c -replace 'bg-gray-50/50', 'bg-white/[0.02]'
        $c = $c -replace 'bg-gray-50', 'bg-white/[0.02]'
        $c = $c -replace 'bg-gray-100', 'bg-white/5'
        $c = $c -replace 'bg-\[#f8f9ff\]', 'bg-[#050505]'
        $c = $c -replace 'bg-purple-50', 'bg-white/5'
        $c = $c -replace 'bg-blue-50', 'bg-white/5'
        $c = $c -replace 'bg-green-50', 'bg-white/5'
        $c = $c -replace 'bg-yellow-50', 'bg-white/5'
        $c = $c -replace 'bg-red-50', 'bg-white/5'
        
        # 2. General Text
        $c = $c -replace 'text-gray-800', 'text-white'
        $c = $c -replace 'text-gray-900', 'text-white'
        $c = $c -replace 'text-gray-700', 'text-gray-200'
        $c = $c -replace 'text-gray-600', 'text-gray-300'
        $c = $c -replace 'text-gray-500', 'text-gray-400'
        $c = $c -replace 'text-\[#6c5ce7\]', 'text-white'
        $c = $c -replace 'text-\[#00cec9\]', 'text-white'
        $c = $c -replace 'text-transparent bg-clip-text bg-gradient-to-r from-\[#6c5ce7\] to-\[#00cec9\]', 'text-white'
        
        # 3. Borders
        $c = $c -replace 'border-gray-100', 'border-white/5'
        $c = $c -replace 'border-gray-200', 'border-white/10'
        $c = $c -replace 'border-gray-300', 'border-white/20'
        $c = $c -replace 'border-\[#6c5ce7\]/20', 'border-white/10'
        $c = $c -replace 'border-\[#6c5ce7\]', 'border-white/20'
        
        # 4. Buttons and Headers (these add back clean white classes so must be after step 1)
        $c = $c -replace 'btn-primary', 'px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors'
        $c = $c -replace 'btn-secondary', 'px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors'
        $c = $c -replace 'navbar-modern', 'border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl'
        
        # 5. Hovers
        $c = $c -replace 'hover:bg-gray-50', 'hover:bg-white/5'
        $c = $c -replace 'hover:bg-white(?!\/)', 'hover:bg-white/10'
        $c = $c -replace 'hover:text-\[#5a4bd6\]', 'hover:text-gray-300'
        $c = $c -replace 'hover:border-\[#6c5ce7\]/20', 'hover:border-white/10'
        $c = $c -replace 'hover:shadow-md', 'hover:shadow-lg hover:shadow-white/5'
        
        Set-Content $f $c -NoNewline
        Write-Output "Updated: $f"
    } else {
        Write-Output "File not found: $f"
    }
}
