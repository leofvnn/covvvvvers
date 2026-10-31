/**
 * Images found by scripts/resolve-images.mjs (run in GitHub Actions), with their sources.
 * Covers in our own bucket don't need this; it's for timeline records and covers
 * that are in the collection before their art has been imported.
 */
import data from "./images.json";

export type ImageSource = { name: string; url: string };
export type RecordImage = { src: string; full?: string; source: ImageSource; cover?: boolean };

const records = (data as { records: Record<string, RecordImage> }).records ?? {};

export const recordImage = (title: string, artist: string): RecordImage | null => records[`${title}|${artist}`] ?? null;
