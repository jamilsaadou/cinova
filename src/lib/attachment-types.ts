// Vérifie le format réel en plus du type MIME fourni par le navigateur.
export function validAttachment(bytes: Uint8Array, mime: string) {
  const starts = (...signature: number[]) => signature.every((byte, i) => bytes[i] === byte);
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (mime === "application/pdf") return ascii(0, 5) === "%PDF-";
  if (mime === "image/png") return starts(137, 80, 78, 71, 13, 10, 26, 10);
  if (mime === "image/jpeg") return starts(255, 216, 255);
  if (mime === "image/gif") return ["GIF87a", "GIF89a"].includes(ascii(0, 6));
  if (mime === "image/webp") return ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
  return false;
}
