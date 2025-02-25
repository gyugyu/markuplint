import type { Nullable } from './types.js';

import { decode as decodeHtmlEntities } from 'html-entities';

/**
 * Converts a given value of string, string array, null, or undefined
 * into an array of non-empty strings.
 *
 * If a string is provided, it wraps it into an array. If null or undefined
 * is provided, an empty array is returned.
 *
 * @param value The input value to be converted to a non-empty string array.
 * @returns The resulting array of non-empty strings derived from the input value.
 */
export function toNoEmptyStringArrayFromStringOrArray(
	value: string | readonly string[] | null | undefined,
): readonly string[] {
	const array = typeof value === 'string' ? [value] : value ?? [];
	return array.filter(noEmptyFilter);
}

/**
 * Converts a given value of an item or an array of items into
 * an array of non-nullable items.
 *
 * @template T The type of the items in the input value.
 * @param value The input value to be converted to a non-nullable item array.
 * @returns The resulting array of non-nullable items derived from the input value.
 */
export function toNonNullableArrayFromItemOrArray<T>(value: T | readonly T[]): readonly NonNullable<T>[] {
	const array: T[] = Array.isArray(value) ? (value as T[]) : [value as T];
	// @ts-ignore
	return array.filter(nonNullableFilter);
}

/**
 * A filter function for use with the `Array.filter` method,
 * which determines if the given string item is non-empty.
 *
 * @param item The string item to be checked for non-emptiness.
 * @returns Returns true if the item is a non-empty string, otherwise false.
 */
export function noEmptyFilter(item: string): item is string {
	return item !== '';
}

/**
 * A filter function for use with the Array.filter method,
 * which determines if the given item is non-nullable.
 *
 * @template T The type of the items in the array.
 * @param item The item to be checked for non-nullability.
 * @returns Returns true if the item is non-nullable, otherwise false.
 */
export function nonNullableFilter<T>(item: Nullable<T>): item is T {
	return item != null;
}

/**
 * Decodes the provided text by replacing HTML entities
 * with their corresponding characters.
 *
 * The decoding process uses the 'html5' (HTML Standard) level.
 *
 * Unknown entities are left as they are.
 *
 * @param text The input text containing HTML entities to be decoded.
 * @returns The decoded text with HTML entities replaced by their corresponding characters.
 */
export function decodeEntities(text: string) {
	return decodeHtmlEntities(text, { level: 'html5' });
}

/**
 * Decodes the provided URL string (href) using
 * the `decodeURIComponent` function.
 *
 * If a `URIError` is encountered,
 * the original href is returned. Any other errors are propagated.
 *
 * @param href The URL string to be decoded.
 * @returns The decoded URL string or the original href if a `URIError` occurs.
 */
export function decodeHref(href: string) {
	try {
		return decodeURIComponent(href);
	} catch (e: unknown) {
		if (e instanceof URIError) {
			return href;
		}
		throw e;
	}
}
