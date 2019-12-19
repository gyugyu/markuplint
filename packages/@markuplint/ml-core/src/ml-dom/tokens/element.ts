import { AnonymousNode, Document } from '../';
import { MLASTElement, MLToken } from '@markuplint/ml-ast';
import { MLDOMAttribute, MLDOMElementCloseTag, MLDOMNode, MLDOMOmittedElement, MLDOMText, MLDOMToken } from './';
import { createNode, createSelector, getNode } from '../helper';
import { ContentModel } from '@markuplint/ml-spec';
import { IMLDOMElement } from '../types';
import { RuleConfigValue } from '@markuplint/ml-config';
import { syncWalk } from '../helper/walkers';

export default class MLDOMElement<T extends RuleConfigValue, O = null> extends MLDOMNode<T, O, MLASTElement>
	implements IMLDOMElement {
	public readonly type = 'Element';
	public readonly nodeName: string;
	public readonly attributes: MLDOMAttribute[];
	public readonly namespaceURI: string;
	public readonly isForeignElement: boolean;
	public readonly closeTag: MLDOMElementCloseTag<T, O> | null;
	public readonly selfClosingSolidus: MLDOMToken<MLToken>;
	public readonly endSpace: MLDOMToken<MLToken>;
	public readonly ownModels: Set<ContentModel> = new Set();
	public readonly childModels: Set<ContentModel> = new Set();
	public readonly descendantModels: Set<ContentModel> = new Set();

	private _fixedNodeName: string;

	constructor(astNode: MLASTElement, document: Document<T, O>) {
		super(astNode, document);
		this.nodeName = astNode.nodeName;
		this._fixedNodeName = astNode.nodeName;
		this.attributes = astNode.attributes.map(attr => new MLDOMAttribute(attr));
		this.selfClosingSolidus = new MLDOMToken(astNode.selfClosingSolidus);
		this.endSpace = new MLDOMToken(astNode.endSpace);
		this.namespaceURI = astNode.namespace;
		this.isForeignElement = this.namespaceURI !== 'http://www.w3.org/1999/xhtml';
		this.closeTag = astNode.pearNode ? createNode(astNode.pearNode, document, this) : null;
	}

	public get raw() {
		const attrs = this.attributes.map(attr => attr.raw).join('');
		return `<${this._fixedNodeName}${attrs}${this.selfClosingSolidus.raw}${this.endSpace.raw}>`;
	}

	public get childNodes(): AnonymousNode<T, O>[] {
		const astChildren = this._astToken.childNodes || [];
		return astChildren.map(node => getNode<typeof node, T, O>(node));
	}

	public querySelectorAll(selector: string) {
		const matchedNodes: (MLDOMElement<T, O> | MLDOMText<T, O>)[] = [];
		syncWalk(this.childNodes, node => {
			if (node.type === 'Element' && node.matches(selector)) {
				matchedNodes.push(node);
			}
			if (selector === '#text' && node.type === 'Text' && !node.isWhitespace()) {
				matchedNodes.push(node);
			}
		});
		return matchedNodes;
	}

	public closest(selector: string) {
		let el: MLDOMElement<T, O> | MLDOMOmittedElement<T, O> | null = this;

		do {
			if (el.matches(selector)) {
				return el;
			}
			el = el.parentNode;
		} while (el !== null && el.type === 'Element');
		return null;
	}

	public getAttributeToken(attrName: string) {
		for (const attr of this.attributes) {
			if (attr.name.raw.toLowerCase() === attrName.toLowerCase()) {
				return attr;
			}
		}
	}

	public getAttribute(attrName: string) {
		for (const attr of this.attributes) {
			if (attr.name.raw.toLowerCase() === attrName.toLowerCase()) {
				return attr.value ? attr.value.raw : null;
			}
		}
		return null;
	}

	public hasAttribute(attrName: string) {
		return !!this.getAttributeToken(attrName);
	}

	public matches(selector: string): boolean {
		return createSelector(selector).match(this);
	}

	public fixNodeName(name: string) {
		this._fixedNodeName = name;
	}

	public getChildElementsAndTextNodeWithoutWhitespaces() {
		const filteredNodes: (MLDOMElement<T, O> | MLDOMText<T, O>)[] = [];
		this.childNodes.forEach(node => {
			if (node.type === 'Element') {
				filteredNodes.push(node);
			}
			if (node.type === 'Text' && !node.isWhitespace()) {
				filteredNodes.push(node);
			}
			if (node.type === 'OmittedElement') {
				const children = node.getChildElementsAndTextNodeWithoutWhitespaces();
				filteredNodes.push(...children);
			}
		});
		return filteredNodes;
	}

	public isDescendantByUUIDList(uuidList: string[]) {
		let el: MLDOMElement<T, O> | MLDOMOmittedElement<T, O> | null = this.parentNode;

		if (el === null) {
			return false;
		}

		do {
			if (uuidList.includes(el.uuid)) {
				return true;
			}
			el = el.parentNode;
		} while (el !== null && el.type === 'Element');
		return false;
	}

	public get classList() {
		const classAttr = this.getAttributeToken('class');
		if (classAttr && classAttr.value) {
			return classAttr.value.raw
				.split(/\s+/g)
				.map(c => c.trim())
				.filter(c => c);
		}
		return [];
	}

	public get id() {
		const idAttr = this.getAttributeToken('id');
		if (idAttr && idAttr.value) {
			return idAttr.value.raw;
		}
		return '';
	}
}
