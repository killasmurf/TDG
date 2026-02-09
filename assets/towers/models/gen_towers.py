#!/usr/bin/env python3
"""
Generate 9 tower OBJ/MTL files styled as Japanese religious buildings.
- Basic (Archer) = Shinto Shrine with torii-gate elements
- Sniper (Ballista) = Buddhist Pagoda with stacked tiers
- Rapid (Crossbow) = Temple Bell Tower (Shoro)
Each has 3 upgrade tiers with increasing ornamentation.
"""

import math

# --- Geometry Helpers ---

class OBJBuilder:
    def __init__(self):
        self.vertices = []
        self.normals = []
        self.faces = []
        self.current_material = None
        self.normals = [
            (0, 0, 1), (0, 0, -1),
            (0, 1, 0), (0, -1, 0),
            (1, 0, 0), (-1, 0, 0),
        ]
