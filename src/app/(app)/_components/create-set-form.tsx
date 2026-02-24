import { createSet } from "@/app/(app)/actions/sets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const THEMES = ["jungle", "cave", "castle", "space", "lava"] as const;

export function CreateSetForm() {
  return (
    <form
      action={createSet}
      className="grid gap-3 border-2 border-border bg-secondary-background p-4 shadow-shadow"
    >
      <div className="text-foreground/60 text-xs uppercase tracking-[0.3em]">
        create set
      </div>
      <Input name="name" placeholder="Set name" required />
      <Input name="description" placeholder="Short description" />
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <label
            className="flex items-center gap-2 border-2 border-border bg-background px-3 py-2 text-xs uppercase tracking-[0.2em]"
            key={theme}
          >
            <input
              defaultChecked={theme === "jungle"}
              name="theme"
              required
              type="radio"
              value={theme}
            />
            {theme}
          </label>
        ))}
      </div>
      <Button type="submit">Create set</Button>
    </form>
  );
}
