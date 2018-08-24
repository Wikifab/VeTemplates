/*!
 * VisualEditor DataModel SimpleTransclusionNode class.
 *
 */

/**
 * DataModel MediaWiki simpletransclusion node.
 * 
 * this represente the node in VE, 
 * it contains informations required to match an html node to the simpleTranslusion Type
 *
 * @class
 * @abstract
 * @extends ve.dm.MWTransclusionBlockNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.SimpleTransclusionNode = function VeDmSimpleTransclusionNode() {
	// Parent constructor
	ve.dm.SimpleTransclusionNode.super.apply( this, arguments );

};

OO.inheritClass( ve.dm.SimpleTransclusionNode, ve.dm.MWTransclusionBlockNode );

/* Static members */

ve.dm.SimpleTransclusionNode.static.name = 'simpleTransclusion';
//ve.dm.SimpleTransclusionNode.static.name = 'mwTransclusion';

ve.dm.SimpleTransclusionNode.static.matchTagNames = ['div', 'p'];

ve.dm.SimpleTransclusionNode.static.matchRdfaTypes = [ 'mw:Transclusion', 'mw:SimpleTemplate' ];


ve.dm.SimpleTransclusionNode.static.matchTemplatesNames = ['Info', 'Idea', 'Warning', 'Dont', 'Pin'];

/**
 * match function to match only element of template defined in matchTemplatesNames
 */
ve.dm.SimpleTransclusionNode.static.matchFunction = function ( node ) {

	var attr = $(node).attr('data-mw');
	if ( !attr) {
		return false;
	}
	attr =  JSON.parse(attr);
	var template = attr.parts && attr.parts[0] && attr.parts[0].template;
	if ( ! template) {
		return false;
	}
	var name = template.target && template.target.wt;
	if ( ! name) {
		return false;
	}
	
	if ( this.matchTemplatesNames.indexOf(name) != -1) {
		return true
	};
	return false;
}


/**
 * Node type to use when the transclusion is a block
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.SimpleTransclusionNode.static.blockType = 'simpleTransclusion';

/**
 * disable slug because there are buggy 
 * (slug are div which appair on mouse over to insert new paragraph before or after element)
 */
ve.dm.SimpleTransclusionNode.prototype.canHaveSlugBefore = function () {
	return true;
};

ve.dm.SimpleTransclusionNode.prototype.canHaveSlugAfter = function () {
	return false;
};

ve.dm.modelRegistry.register( ve.dm.SimpleTransclusionNode );
