// Real photos: put bakkie.(jpg|png|webp) and bakkie-trailer.(jpg|png|webp) of your own vehicle in src/assets/fleet/. Drawn art is shown until then.
const photos = import.meta.glob("/src/assets/fleet/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" }) as Record<string, string>;
export const photo = (name: string) => Object.entries(photos).find(([p]) => new RegExp(`/${name}\\.(jpg|jpeg|png|webp)$`).test(p))?.[1];
