## 👨‍💻  Updated Step 3.3 – Install the Blender 3‑D Generation addon

- **Explicit Requirements**
  1. Install Blender 3.3 or newer on the system.
  2. Ensure the "Hunyuan3D" (or other AI‑3D) add‑on is installed by adding the addon‑zip file to Blender’s **Preferences → Add‑ons → Install…**.
  3. Enable the add‑on and confirm it appears under **Python Add‑ons**.
  4. Verify the add‑on loads correctly by launching the Blender text editor and running:

```python
import bpy
print(bpy.context.preferences.addons.get('hunyuan3d'))
```

- **Implicit Requirements**
  1. The addon must be **importable** without errors (`import humyuan3d`).
  2. All dependency packages that the addon requires (e.g., `requests`, `torch`) are installed in the Blender Python environment.
  3. The add‑on’s UI panel appears in the **N‑panel** of the 3‑D view.
  4. The add‑on’s `generate` function can be called from a script like:

```python
import bpy
result = bpy.ops.hunyuan3d.generate("A crawling demon dog, realistic style, dark fur, glowing red eyes, sharp claws")
print(result)
```

- **Time**: 2026‑02‑11 16:46.00 UTC
- **Working directory**: `C:\Users\Adam Murphy\AI\TDG`
