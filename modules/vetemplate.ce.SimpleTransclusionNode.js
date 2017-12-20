/*!
 * VisualEditor ContentEditable SimpleTransclusionNode class.
 *
 */

/**
 * ContentEditable MediaWiki transclusion node.
 * 
 * 
 * this represente the node object in the visual editor
 * there is two way to create a node  : 
 * - add a toolbar command using the template type 'simpleTransclusion' (in file vetemplate.simpletemplateregister.js)
 * - when VE in loaded, it should create the corresponding node for existing templates ( not working yet)
 *
 * @class
 * @abstract
 * @extends ve.ce.LeafNode
 * @mixins ve.ce.GeneratedContentNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.TableCellableNode
 *
 * @constructor
 * @param {ve.dm.MWTransclusionNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.SimpleTransclusionNode = function veceSimpleTransclusionNode( model, config ) {
	// Parent constructor
	ve.ce.SimpleTransclusionNode.super.call( this, model, config );
};

/* Inheritance */

OO.inheritClass( ve.ce.SimpleTransclusionNode, ve.ce.MWTransclusionBlockNode);

/* Static Properties */

// replace mwTransclusion by simpleTransclusion
ve.ce.SimpleTransclusionNode.static.name = 'simpleTransclusion'; 

// to change to get an other command : 
ve.ce.SimpleTransclusionNode.static.primaryCommandName = 'simpletemplatecommand';


/**
 * @inheritdoc
 */
ve.ce.SimpleTransclusionNode.prototype.onSetup = function () {
	// Parent method
	ve.ce.SimpleTransclusionNode.super.prototype.onSetup.apply( this, arguments );

	// Render replaces this.$element with a new node so re-add classes
	this.$element.addClass( 'vetemplate-simpleTransclusionNode' );
};


ve.ce.nodeFactory.register( ve.ce.SimpleTransclusionNode );

