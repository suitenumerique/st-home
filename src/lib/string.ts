export function unaccent(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, " ")
    .replace(/\bst\b/, "saint")
    .toLowerCase()
    .trim();
}
