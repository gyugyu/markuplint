// @ts-ignore
import { computeAccessibleName } from 'dom-accessibility-api';

export function getAccname(
	// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
	el: Element,
): string {
	return computeAccessibleName(el);
}
