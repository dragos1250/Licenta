const IMAGE_BASE_URL =
  import.meta.env.VITE_PRODUCT_IMAGE_BASE_URL || "/images/products";

const PLACEHOLDER_IMAGE =
  import.meta.env.VITE_PRODUCT_PLACEHOLDER_URL ||
  `${String(IMAGE_BASE_URL).replace(/\/+$/, "")}/placeholder.webp`;

export function resolveProductImage(imageValue) {
  if (!imageValue || typeof imageValue !== "string") {
    return PLACEHOLDER_IMAGE;
  }

  const trimmed = imageValue.trim();

  if (!trimmed) {
    return PLACEHOLDER_IMAGE;
  }

  // URL extern complet
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // protocol-relative URL: //cdn.site.com/image.webp
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // data URL / blob URL
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // dacă deja e path public complet
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  const cleanBase = String(IMAGE_BASE_URL).replace(/\/+$/, "");
  const cleanValue = trimmed.replace(/^\/+/, "");

  return `${cleanBase}/${cleanValue}`;
}

export { PLACEHOLDER_IMAGE };