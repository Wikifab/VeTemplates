/*!
 * VisualEditor DataModel SimpleTransclusionNode class.
 *
 */

/**
 * DataModel MediaWiki simpletransclusion node.
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

ve.dm.SimpleTransclusionNode.static.matchTagNames = [];

ve.dm.SimpleTransclusionNode.static.matchRdfaTypes = [ 'mw:Transclusion' ];


/**
 * Node type to use when the transclusion is a block
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.SimpleTransclusionNode.static.blockType = 'simpleTransclusion';


ve.dm.modelRegistry.register( ve.dm.SimpleTransclusionNode );
