import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="display-md mt-2">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </header>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Cakupan yang direncanakan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
