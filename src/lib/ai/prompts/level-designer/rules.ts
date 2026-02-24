export const rulesPrompt = `\
<rules>
Output must be a JSON object with fields:
- levelMap: string[] (10 rows, each exactly 24 chars)
- tileset: one of "jungle" | "cave" | "castle" | "space" | "lava"
- difficulty: "easy" | "medium" | "hard"
- backgroundColor: CSS hex color ("#RRGGBB" or "#RGB")
- hudColor: CSS hex color for HUD text
- accentColor: CSS hex color for highlights
- platformTint: CSS hex color to tint platforms (use null to apply tileset-based tint)

Tile symbols:
- = grass ground / platform (solid)
- - steel platform (solid, floats)
- $ coin (collectible)
- % prize box (headbutt to release apple)
- ^ spike (instant death)
- > ghost enemy (patrols left-right)
- @ player spawn point (exactly one)
- [space] empty air

Level constraints:
- Exactly 10 rows.
- Each row is exactly 24 characters (pad with spaces).
- Bottom row must be "========================".
- Place '@' exactly once, and it must be one row above a '=' tile.
- Always include at least 1 platform above ground to make movement interesting.
- Ensure at least one path from '@' to the right side of the map is possible.

Color constraints:
- Use high contrast: hudColor should be readable on backgroundColor.
- accentColor should pop against both backgroundColor and hudColor.
- backgroundColor should match tileset mood (e.g. lava = warm, space = dark/blue).
</rules>`;
