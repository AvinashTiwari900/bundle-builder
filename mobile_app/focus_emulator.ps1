Add-Type @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WinAPI {
    public delegate bool CallBackPtr(IntPtr hwnd, int lParam);

    [DllImport("user32.dll")]
    public static extern int EnumWindows(CallBackPtr callPtr, int lPar);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder title, int size);
}
"@

$procs = Get-Process -Name qemu-system*,emulator* -ErrorAction SilentlyContinue
if (-not $procs) {
    Write-Host "No emulator processes running."
    exit 0
}

$procIds = $procs.Id
Write-Host "Emulator PIDs: $($procIds -join ', ')"

$found = $false
[WinAPI]::EnumWindows({
    param($hwnd, $lparam)
    $processId = 0
    [WinAPI]::GetWindowThreadProcessId($hwnd, [ref]$processId)
    if ($procIds -contains $processId) {
        $sb = New-Object System.Text.StringBuilder 256
        [WinAPI]::GetWindowText($hwnd, $sb, 256)
        $title = $sb.ToString()
        Write-Host "Found window for PID $($processId): '$title' (HWND: $hwnd)"
        # 9 = SW_RESTORE, 1 = SW_SHOWNORMAL
        [WinAPI]::ShowWindow($hwnd, 9)
        [WinAPI]::SetForegroundWindow($hwnd)
        $script:found = $true
    }
    return $true
}, 0)

if (-not $found) {
    Write-Host "No windows found for emulator process."
}
