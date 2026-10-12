export const asset = (name) => new URL(`../assets/${name}`, import.meta.url).href;
