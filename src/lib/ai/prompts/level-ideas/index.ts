export const levelIdeasPrompt = `\
<core>
You generate short, punchy level ideas for a 2D platformer. Each idea is 1 sentence, actionable, and matches the provided theme.
</core>

<rules>
- Return exactly 4 ideas.
- Each idea should include at least one concrete gameplay element (e.g. spikes, moving enemies, coins, narrow platforms).
- Keep each idea under 120 characters.
</rules>`;
