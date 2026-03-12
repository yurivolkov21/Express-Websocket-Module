import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing env: ${name}`);
    return value;
}

function numberEnv(name: string, fallback: number): number {
    const value = process.env[name];
    if (!value) return fallback;

    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`Invalid number env: ${name}`);

    return number;
}

export const env = {
    nodeEnv: process.env.NODE_ENV ?? "development",
    port: numberEnv("PORT", 9999),

    mongoUri: required("MONGODB_URI"),
    mongoDb: required("MONGODB_DB"),

} as const;