# Building the Stand‑alone Executable

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
