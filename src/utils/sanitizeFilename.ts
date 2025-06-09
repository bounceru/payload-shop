// File: src/utils/sanitizeFilename.ts

/**
 * Ensures the filename only contains letters, digits, dashes, underscores, and dots.
 * Replaces all other characters with underscores.
 * Optionally limits length to 100 characters.
 */
export function sanitizeFilename(originalName: string): string {
    const sanitized = originalName
        .trim()
        // Replace non-allowed characters with underscore
        .replace(/[^A-Za-z0-9._-]/g, "_")
        // Limit length to 100 chars (optional)
        .slice(0, 100);

    return sanitized || "upload_file";
}
