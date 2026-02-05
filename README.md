# Tower Defense Game (TDG)

A complete tower defense game built with vanilla JavaScript and rendered on HTML5 Canvas. Defend your base from waves of enemies by strategically placing towers along their path.

## Features

### Main Menu System
- Professional main menu screen on startup
- Select from 4 different maps before playing
- Access settings (volume, difficulty)
- Exit game functionality

### Multiple Maps
- **Default Map** - Standard winding path ($100, 20 lives)
- **Straight Shot** - Simple straight path for testing ($150, 15 lives)
- **Serpentine Path** - S-shaped challenging path ($125, 25 lives)
- **Spiral Fortress** - Complex spiral to center ($200, 30 lives)

### Tower Defense Gameplay
- **3 Tower Types**: Basic, Sniper, and Rapid-fire
- **Smart Placement Validation**: Prevents placing towers on paths
- **Wave System**: Start/pause waves with SPACE
- **Pause Menu**: Press ESC for pause menu with Continue/Restart/Exit options

### Map System
- JSON-based map files for easy customization
- Custom waypoint paths
- Configurable starting resources per map
- See [MAP_SYSTEM_IMPLEMENTATION.md](MAP_SYSTEM_IMPLEMENTATION.md) for details

## Controls

- **1, 2, 3** - Select tower type (Basic, Sniper, Rapid)
- **Click** - Place selected tower
- **SPACE** - Start/pause current wave
- **ESC** - Open pause menu
- **Arrow Keys** - Navigate pause menu
- **Enter** - Select pause menu option

## Getting Started

### Running the Game (Development)

```bash
npm start
```

This launches the game in Electron.

### Running Tests

```bash
npm test
```

All 38 unit tests should pass.

## Building the Stand‑alone Executable

> **How to actually invoke the batch file** (the file is `build_exe.bat`).
>
> 1. **From a normal CMD window**:
>
>    ```cmd
>    cd C:\Users\Adam Murphy\AI\TDG
>    build_exe.bat    # or \\full\path\build_exe.bat
>    ```
>
> 2. **From PowerShell** (same command works):
>
>    ```powershell
>    cd C:\Users\Adam Murphy\AI\TDG
>    .\build_exe.bat
>    ```
>
> 3. **Double‑click** the `build_exe.bat` file in Explorer. The command window will open, run the script, and close when finished.
>
> 4. If you just type `build_exe` without the `.bat` extension the shell looks for a file named `build_exe.*` in your PATH and, if it finds the npm executable (which prints the pkg version), it runs that instead.
>
> **Result** – after the script finishes you should see**:
>
> ```txt
> Build succeeded. executable located in "dist\tdg-win.exe"
> ```
>
> 5. Open the executable:
>
> ```cmd
> dist\tdg-win.exe
> ```
>
> A window with the Tower‑Defense canvas will pop up.
>
> ---
>
> **Troubleshooting**
>
> * If you see no output or the console flicks too fast, run the batch file from a terminal (CMD or PowerShell) instead of double‑clicking it.
> * Ensure you’re in the correct directory (`C:\Users\Adam Murphy\AI\TDG`).
> * If you still get “node is not recognized”, check that the Node installer added `C:\Program Files\nodejs\` to your PATH and re‑open the terminal.
> * If `pkg` fails, run `npm install -g pkg` again.
> 
> These steps are added to the *README* section above so anyone clicking the file will know how to get the build. 
