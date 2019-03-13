/*!
 * VisualEditor DataModel AnnotatedImageContainerNode class.
 *
 */

/**
 * DataModel MediaWiki AnnotatedImageContainerNode node.
 *
 * this represente the node in VE,
 * it contains informations required to match an html node to the AnnotatedImageContainerNode Type
 *
 * @class
 * @abstract
 * @extends ve.dm.MWTransclusionBlockNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AnnotatedImageContainerNode = function VeDmAnnotatedImageContainerNode() {
	// Parent constructor
	ve.dm.AnnotatedImageContainerNode.super.apply( this, arguments );

};

OO.inheritClass( ve.dm.AnnotatedImageContainerNode, ve.dm.MWTransclusionBlockNode );

/* Static members */

ve.dm.AnnotatedImageContainerNode.static.name = 'annotatedImageTransclusion';
//ve.dm.AnnotatedImageContainerNode.static.name = 'mwTransclusion';

ve.dm.AnnotatedImageContainerNode.static.matchTagNames = ['div', 'p'];

ve.dm.AnnotatedImageContainerNode.static.matchRdfaTypes = [ 'mw:Transclusion', 'mw:SimpleTemplate' ];


ve.dm.AnnotatedImageContainerNode.static.matchTemplatesNames = ['#annotatttedImage'];

/**
 * match function to match only element of template defined in matchTemplatesNames
 */
ve.dm.AnnotatedImageContainerNode.static.matchFunction = function ( node ) {

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

	for (var index in this.matchTemplatesNames) {
		if (name.startsWith(this.matchTemplatesNames[index])) {
			console.log('match template annotated image');
			console.log(attr);
			console.log(node);
			return true
		}
	}
	return false;
}


/**
 * Node type to use when the transclusion is a block
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.AnnotatedImageContainerNode.static.blockType = 'annotatedImageTransclusion';


ve.dm.modelRegistry.register( ve.dm.AnnotatedImageContainerNode );
