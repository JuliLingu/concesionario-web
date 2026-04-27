/**
 * Transforms a Cloudinary image URL to apply smart auto-cropping.
 *
 * Without transformation, Cloudinary delivers the raw uploaded image.
 * `c_fill` makes it fill the target dimensions; `g_auto` uses AI to
 * detect the main subject (the car) and keeps it centered in the frame.
 *
 * Usage:
 *   getCldUrl("https://res.cloudinary.com/.../upload/v1/photo.jpg", "4:3")
 *   → "https://res.cloudinary.com/.../upload/c_fill,g_auto,ar_4:3/v1/photo.jpg"
 */
export function getCldUrl(
  url: string,
  aspectRatio: "4:3" | "16:9" | "1:1" = "4:3"
): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  // Avoid double-applying transformations
  if (url.includes("/c_fill")) return url;

  return url.replace(
    "/upload/",
    `/upload/c_fill,g_auto,ar_${aspectRatio}/`
  );
}
