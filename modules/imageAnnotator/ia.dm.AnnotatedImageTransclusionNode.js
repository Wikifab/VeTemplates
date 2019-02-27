/*!
 * VisualEditor DataModel AnnotatedImageTransclusionNode class.
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
ve.dm.AnnotatedImageTransclusionNode = function VeDmAnnotatedImageTransclusionNode() {
	// Parent constructor
	ve.dm.AnnotatedImageTransclusionNode.super.apply( this, arguments );

};

OO.inheritClass( ve.dm.AnnotatedImageTransclusionNode, ve.dm.MWTransclusionBlockNode );

/* Static members */

ve.dm.AnnotatedImageTransclusionNode.static.name = 'annotatedImageTransclusion';
//ve.dm.AnnotatedImageTransclusionNode.static.name = 'mwTransclusion';

ve.dm.AnnotatedImageTransclusionNode.static.matchTagNames = ['div', 'p'];

ve.dm.AnnotatedImageTransclusionNode.static.matchRdfaTypes = [ 'mw:Transclusion', 'mw:SimpleTemplate' ];


ve.dm.AnnotatedImageTransclusionNode.static.matchTemplatesNames = ['annotatedImage'];

/**
 * match function to match only element of template defined in matchTemplatesNames
 */
ve.dm.AnnotatedImageTransclusionNode.static.matchFunction = function ( node ) {

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
ve.dm.AnnotatedImageTransclusionNode.static.blockType = 'annotatedImageTransclusion';


ve.dm.modelRegistry.register( ve.dm.AnnotatedImageTransclusionNode );
