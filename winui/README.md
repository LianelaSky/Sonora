# Sonora Music — Pure Windows Native (C# / WinUI 3 / WASAPI)

This is the **pure native Windows desktop edition** of Sonora Music, built with **.NET 8**, **WinUI 3 (Windows App SDK)**, and **NAudio WASAPI Exclusive Mode**.

## Architectural Highlights
- **Framework**: C# / .NET 8 + WinUI 3 (Windows App SDK 1.6)
- **Design System**: Windows 11 Fluent Design System with native Mica backdrop and Acrylic materials
- **Audio Engine**: Windows **WASAPI Exclusive Mode** (`AudioClientShareMode.Exclusive`)
  - Bypasses the Windows Audio Session mixer (`audiodg.exe`)
  - Bit-perfect streaming up to **24-bit / 192 kHz** directly to external USB DACs
  - 10-Band IIR Biquad Graphic Equalizer running directly on raw audio frames
  - Apple Music Sound Check (LUFS / RMS loudness normalization)
- **Tag & Metadata Engine**: `TagLib#` for lossless ID3v2, FLAC Vorbis comments, and ALAC metadata extraction
- **Live Lyrics**: Asynchronous LRCLIB synchronized lyrics client with real-time parser
- **Shazam Auto-Detection**: Acoustic duration & fingerprint matcher with iTunes API resolution

---

## How to Build & Run on Windows

### Prerequisites
1. **Windows 10 (version 1809 / build 17763 or newer)** or **Windows 11**
2. **.NET 8 SDK** (Download from [dot.net](https://dotnet.microsoft.com/download))
3. **Visual Studio 2022** with the workload:
   - **.NET Desktop Development**
   - **Windows App SDK C# Templates** (or install via `dotnet new install Microsoft.WindowsAppSDK.Templates`)

---

### Method 1: Command Line (.NET CLI)

1. Open **PowerShell** or **Windows Terminal** in the `winui/Sonora.Native` directory:
   ```powershell
   cd winui/Sonora.Native
   ```

2. Restore NuGet dependencies:
   ```powershell
   dotnet restore
   ```

3. Build and Run:
   ```powershell
   dotnet run
   ```

4. Publish a standalone, self-contained, optimized native Windows `.exe`:
   ```powershell
   dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
   ```
   The single native executable will be located in:
   `bin\Release\net8.0-windows10.0.19041.0\win-x64\publish\Sonora.Native.exe`

---

### Method 2: Visual Studio 2022

1. Open `Sonora.Native.csproj` in Visual Studio 2022.
2. Select target platform: `x64` (or `ARM64` on Surface Pro Copilot+ PCs).
3. Set `Sonora.Native` as the Startup Project.
4. Press `F5` to build and debug.
