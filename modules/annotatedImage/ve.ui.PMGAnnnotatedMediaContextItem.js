/*!
 * VisualEditor PMGAnnotatedMediaContextItem class.
 *
 * @copyright 2011-2017 VisualEditor Team and others; see http://ve.mit-license.org
 */

/**
 * Context item for a MWImageNode, or a PMGAnnotatedImageNode
 * this replaces the MWMediaContextItem to use Annotated model
 *
 * @class
 * @extends ve.ui.LinearContextItem
 *
 * @constructor
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.PMGAnnotatedMediaContextItem = function VeUiPMGAnnotatedMediaContextItem( context, model ) {
	var mediaClass;

	// Parent constructor
	ve.ui.PMGAnnotatedMediaContextItem.super.apply( this, arguments );

	// Initialization
	this.$element.addClass( 've-ui-mwPMGAnnotatedMediaContextItem' );

};

/* Inheritance */

//OO.inheritClass( ve.ui.PMGAnnotatedMediaContextItem, ve.ui.LinearContextItem );
OO.inheritClass( ve.ui.PMGAnnotatedMediaContextItem, ve.ui.MWMediaContextItem );

/* Static Properties */

ve.ui.PMGAnnotatedMediaContextItem.static.name = 'pmgMedia';

ve.ui.PMGAnnotatedMediaContextItem.static.icon = 'image';

ve.ui.PMGAnnotatedMediaContextItem.static.label =
	OO.ui.deferMsg( 'visualeditor-media-title-image' );

ve.ui.PMGAnnotatedMediaContextItem.static.modelClasses = [ ve.dm.PMGAnnotatedImageModel, ve.dm.MWBlockImageNode, ve.dm.MWInlineImageNode ];

ve.ui.PMGAnnotatedMediaContextItem.static.commandName = 'mediapmg';

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.PMGAnnotatedMediaContextItem.prototype.getDescription = function () {
	return ve.ce.nodeFactory.getDescription( this.model );
};

/**
 * @inheritdoc
 */
ve.ui.PMGAnnotatedMediaContextItem.prototype.renderBody = function () {
	this.$body.append(
		$( '<a>' )
			.text( this.getDescription() )
			.attr( {
				href: mw.util.getUrl( this.model.getAttribute( 'resource' ) ),
				target: '_blank',
				rel: 'noopener'
			} )
	);
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.PMGAnnotatedMediaContextItem );
