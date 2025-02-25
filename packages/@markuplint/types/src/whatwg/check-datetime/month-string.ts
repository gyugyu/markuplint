import type { CustomSyntaxChecker } from '../../types.js';

import { log } from '../../debug.js';
import { TokenCollection } from '../../token/index.js';

import { datetimeTokenCheck } from './datetime-tokens.js';

/**
 * @see https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-month-string
 */
export const checkMonthString: CustomSyntaxChecker = () =>
	function checkMonthString(value) {
		log('CHECK: month-string');

		const tokens = TokenCollection.fromPatterns(value, [/[^-]*/, /[^0-9]?/, /.[0-9]*/]);

		log('Month: "%s" => %O', tokens.value, tokens);

		const res = tokens.eachCheck(
			datetimeTokenCheck.year,
			datetimeTokenCheck.hyphen,
			datetimeTokenCheck.month,
			datetimeTokenCheck.extra,
		);

		if (!res.matched) {
			log('Failed: %O', res);
		}

		return res;
	};
