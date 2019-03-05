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


ve.ce.AnnotatedImageTransclusionNode.prototype.hasRendering  = function () {
	return true;
}

/**
 * @inheritdoc
 */
ve.ce.AnnotatedImageTransclusionNode.prototype.onSetup = function () {
	// Parent method
	ve.ce.AnnotatedImageTransclusionNode.super.prototype.onSetup.apply( this, arguments );

	// Render replaces this.$element with a new node so re-add classes
	this.$element.addClass( 'vetemplate-AnnotatedImageTransclusionNode' );
};


/**
 * Handle a successful response from the parser for the wikitext fragment.
 *
 * @param {jQuery.Deferred} deferred The Deferred object created by #generateContents
 * @param {Object} response Response data
 */
ve.ce.AnnotatedImageTransclusionNode.prototype.onParseSuccess = function ( deferred, response ) {
	var contentNodes;

	ve.ce.AnnotatedImageTransclusionNode.super.prototype.onSetup.onParseSuccess( this, arguments );

	if ( ve.getProp( response, 'visualeditor', 'result' ) == 'success' ) {
		console.log("AnnotatedImageTransclusionNode.onParseSuccess 2");
		contentNodes = $.parseHTML( response.visualeditor.content, this.model && this.getModelHtmlDocument() ) || [];
		//deferred.resolve( this.constructor.static.filterRendering( contentNodes ) );
		console.log(contentNodes);
	}

};


ve.ce.nodeFactory.register( ve.ce.AnnotatedImageTransclusionNode );

