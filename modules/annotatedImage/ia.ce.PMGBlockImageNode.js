/*!
 * VisualEditor ContentEditable PMGBlockImageNode class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable annotated image node.
 *
 * @class
 * @extends ve.ce.BranchNode
 * @mixins ve.ce.MWImageNode
 *
 * @constructor
 * @param {ve.dm.PMGBlockImageNode} model Model to observe
 * @param {Object} [config] Configuration options
 */
ve.ce.PMGBlockImageNode = function VeCePMGBlockImageNode() {

	// Parent constructor
	ve.ce.PMGBlockImageNode.super.apply( this, arguments );
};

/* Inheritance */

OO.inheritClass( ve.ce.PMGBlockImageNode, ve.ce.MWBlockImageNode );


/* Static Properties */

ve.ce.PMGBlockImageNode.static.name = 'pmgBlockImage';

ve.ce.PMGBlockImageNode.static.tagName = 'figure';

ve.ce.PMGBlockImageNode.static.primaryCommandName = 'mediapmg';


/* Methods */

/**
 * Update CSS classes based on alignment and type
 *
 * @param {string} [oldAlign] The old alignment, for removing classes
 */
ve.ce.PMGBlockImageNode.prototype.updateClasses = function ( oldAlign ) {
	var alignClass,
		align = this.model.getAttribute( 'align' ),
		type = this.model.getAttribute( 'type' );

	if ( oldAlign && oldAlign !== align ) {
		// Remove previous alignment
		this.$element
			.removeClass( this.getCssClass( 'none', oldAlign ) )
			.removeClass( this.getCssClass( 'default', oldAlign ) );
	}

	if ( type !== 'none' && type !== 'frameless' ) {
		alignClass = this.getCssClass( 'default', align );
		this.$image.addClass( 've-ce-mwBlockImageNode-thumbimage' );
	} else {
		alignClass = this.getCssClass( 'none', align );
		this.$image.removeClass( 've-ce-mwBlockImageNode-thumbimage' );
	}
	this.$element.addClass( alignClass );

	// Border
	this.$element.toggleClass( 'mw-image-border', !!this.model.getAttribute( 'borderImage' ) );

	switch ( alignClass ) {
		case 'mw-halign-right':
			this.showHandles( [ 'sw' ] );
			break;
		case 'mw-halign-left':
			this.showHandles( [ 'se' ] );
			break;
		case 'mw-halign-center':
			this.showHandles( [ 'sw', 'se' ] );
			break;
		default:
			this.showHandles();
			break;
	}
};

/**
 * Redraw the image and its wrappers at the specified dimensions
 *
 * The current dimensions from the model are used if none are specified.
 *
 * @param {Object} [dimensions] Dimension object containing width & height
 */
ve.ce.PMGBlockImageNode.prototype.updateSize = function ( dimensions ) {
	var
		type = this.model.getAttribute( 'type' ),
		borderImage = this.model.getAttribute( 'borderImage' ),
		hasBorderOrFrame = ( type !== 'none' && type !== 'frameless' ) || borderImage;

	if ( !dimensions ) {
		dimensions = {
			width: this.model.getAttribute( 'width' ),
			height: this.model.getAttribute( 'height' )
		};
	}

	this.$image.css( dimensions );

	// Make sure $element is sharing the dimensions, otherwise 'middle' and 'none'
	// positions don't work properly
	this.$element.css( {
		width: dimensions.width + ( hasBorderOrFrame ? 2 : 0 ),
		height: hasBorderOrFrame ? 'auto' : dimensions.height
	} );
	this.$element.toggleClass( 'mw-default-size', !!this.model.getAttribute( 'defaultSize' ) );
};



ve.ce.PMGBlockImageNode.prototype.getDomPosition = function () {
	// We need to override this because this.$element can have children other than renderings of child
	// CE nodes (specifically, the image itself, this.$a), which throws the calculations out of whack.
	// Luckily, PMGBlockImageNode is very simple and can contain at most one other node: its caption,
	// which is always inserted at the end.
	var domNode = this.$element.last()[ 0 ];
	return {
		node: domNode,
		offset: domNode.childNodes.length
	};
};

/**
 * @inheritdoc ve.ce.GeneratedContentNode
 */
ve.ce.PMGBlockImageNode.prototype.generateContents = function () {
	console.log('PMGBlockImageNode.prototype.generateContents');
	ve.ce.PMGBlockImageNode.super.prototype.generateContents.apply( this, arguments );
}
/* Registration */

ve.ce.nodeFactory.register( ve.ce.PMGBlockImageNode );
