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
 * - add a toolbar command using the template type 'annotatedImageTranslcusion'
 * - when VE in loaded, it should create the corresponding node for existing templates
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
ve.ce.AnnotatedImageTransclusionNode = function veceAnnotatedImageTransclusionNode( model, config ) {
	// Parent constructor
	ve.ce.AnnotatedImageTransclusionNode.super.call( this, model, config );
};

/* Inheritance */

OO.inheritClass( ve.ce.AnnotatedImageTransclusionNode, ve.ce.MWTransclusionBlockNode);

/* Static Properties */

// replace mwTransclusion by annotatedImageTransclusion
ve.ce.AnnotatedImageTransclusionNode.static.name = 'annotatedImageTransclusion';

// to change to get an other command :
ve.ce.AnnotatedImageTransclusionNode.static.primaryCommandName = 'annotatedImagecommand';


/**
 * @inheritdoc
 */
ve.ce.AnnotatedImageTransclusionNode.prototype.onSetup = function () {
	// Parent method
	ve.ce.AnnotatedImageTransclusionNode.super.prototype.onSetup.apply( this, arguments );

	// Render replaces this.$element with a new node so re-add classes
	this.$element.addClass( 'vetemplate-AnnotatedImageTransclusionNode' );
};


ve.ce.nodeFactory.register( ve.ce.AnnotatedImageTransclusionNode );

