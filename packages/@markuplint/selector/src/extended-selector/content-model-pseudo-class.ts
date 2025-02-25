import type { SelectorMatchedResult, SelectorResult } from '../types.js';
import type { Category, MLMLSpec } from '@markuplint/ml-spec';

import { contentModelCategoryToTagNames } from '@markuplint/ml-spec';

import { createSelector } from '../create-selector.js';

export function contentModelPseudoClass(specs: MLMLSpec) {
	return (category: string) =>
		(
			// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
			el: Element,
		): SelectorResult => {
			category = category.trim().toLowerCase();

			const selectors = contentModelCategoryToTagNames(`#${category}` as Category, specs.def);
			const matched = selectors
				.map<SelectorResult[]>(selector => {
					if (selector === '#custom') {
						// @ts-ignore
						if (el.isCustomElement) {
							return [
								{
									specificity: [0, 1, 0],
									matched: true,
									nodes: [el],
									has: [],
								},
							];
						}
						return [
							{
								specificity: [0, 1, 0],
								matched: false,
							},
						];
					}
					if (selector === '#text') {
						return [
							{
								specificity: [0, 1, 0],
								matched: false,
							},
						];
					}

					return createSelector(selector, specs).search(el);
				})
				.flat()
				.filter((m): m is SelectorMatchedResult => m.matched);

			if (matched.length > 0) {
				return {
					specificity: [0, 1, 0],
					matched: true,
					nodes: matched.map(m => (m.matched ? m.nodes : [])).flat(),
					has: matched.map(m => (m.matched ? m.has : [])).flat(),
				};
			}

			return {
				specificity: [0, 1, 0],
				matched: false,
			};
		};
}
