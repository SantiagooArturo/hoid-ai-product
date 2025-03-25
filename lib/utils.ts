import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalizeFirstLetter(string: string): string {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}
