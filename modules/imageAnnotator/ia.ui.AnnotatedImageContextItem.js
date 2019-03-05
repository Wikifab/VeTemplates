
/**
 * this is the object corresponding to the context popup that appear when click on a template node in VE
 *
 */
/**
 * Context item for a AnnotatedImageTransclusionNode.
 *
 * @class
 * @extends ve.ui.LinearContextItem
 *
 * @constructor
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.AnnotatedImageContextItem = function VeUiAnnotatedImageContextItem() {
	// Parent constructor
	ve.ui.AnnotatedImageContextItem.super.apply( this, arguments );

	// Initialization
	this.$element.addClass( 've-ui-annotatedImageContextItem' );


	// if i18n message exists for this template, we use it :
	var templateName = ve.ce.MWTransclusionNode.static.getDescription( this.model ).toLowerCase();
	var label = mw.message( 'vetemplate-dialogbutton-annotatedimage-title-' + templateName );
	if( label.exists() ) {
		this.setLabel( label.text() );
	} else {
		console.log('message doesn\'t exists : ' + 'vetemplate-dialogbutton-annotatedimage-title-' + templateName );
	}
};

/* Inheritance */

OO.inheritClass( ve.ui.AnnotatedImageContextItem, ve.ui.MWTransclusionContextItem );

//OO.inheritClass( ve.ui.AnnotatedImageContextItem, ve.ui.MWTransclusionContextItem );

/* Static Properties */
ve.ui.AnnotatedImageContextItem.static.name = 'AnnotatedImageContext';

ve.ui.AnnotatedImageContextItem.static.icon = 'image';


ve.ui.AnnotatedImageContextItem.static.embeddable = true;

// label de la popup de context :
ve.ui.AnnotatedImageContextItem.static.label =
	OO.ui.deferMsg( 'visualeditor-dialogbutton-template-tooltip' );


ve.ui.AnnotatedImageContextItem.static.modelClasses = [ ve.dm.AnnotatedImageTransclusionNode, ve.dm.PMGAnnotatedImageModel];
//ve.ui.AnnotatedImageContextItem.static.modelClasses = [ ve.dm.AnnotatedImageTransclusionNode, ve.dm.MWBlockImageNode, ve.dm.MWInlineImageNode ];


// command name is the command executed on edit click
ve.ui.AnnotatedImageContextItem.static.commandName = 'mediapmg';
//ve.ui.AnnotatedImageContextItem.static.commandName = 'comment';

/**
 * Only display item for single-template transclusions of these templates.
 *
 * @property {string|string[]|null}
 * @static
 * @inheritable
 */
ve.ui.AnnotatedImageContextItem.static.template = ['annotatedImage', '#annotatedImage'];

/* Static Methods */

/**
 * @static
 * @localdoc Sharing implementation with ve.ui.MWTransclusionDialogTool
 */
//ve.ui.AnnotatedImageContextItem.static.isCompatibleWith =
//	ve.ui.MWTransclusionDialogTool.static.isCompatibleWith;

ve.ui.AnnotatedImageContextItem.static.isCompatibleWith = function ( model ) {
	var compatible;
	// Parent method
	compatible = ve.ui.AnnotatedImageContextItem.super.static.isCompatibleWith.call( this, model );

	if ( compatible && this.template ) {
		if( model.type == "annotatedImageTransclusion") {
			return true;
		}
	}

	return compatible;
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.AnnotatedImageContextItem.prototype.getDescription = function () {
	// new description : template text value
	// get the value from the source, in add it into the form
	var surfaceModel = this.context.getSurface().getModel();
	var selection = surfaceModel.getSelection();
	//this.selectedNode.getAttribute( 'mw' );

console.log("ve.ui.AnnotatedImageContextItem.prototype.getDescription");
	// old description : texte including template name :
	return ve.msg(
		'visualeditor-dialog-annotatedImage-description',
		ve.ce.MWTransclusionNode.static.getDescription( this.model ),
		ve.ce.MWTransclusionNode.static.getTemplatePartDescriptions( this.model ).length
	);
};



/**
 * @inheritdoc
 */
ve.ui.AnnotatedImageContextItem.prototype.ssonEditButtonClick = function () {
	var surfaceModel = this.context.getSurface().getModel(),
		selection = surfaceModel.getSelection();

	if ( selection instanceof ve.dm.TableSelection ) {
		surfaceModel.setLinearSelection( selection.getOuterRanges()[ 0 ] );
	}

	// Parent method
	ve.ui.AnnotatedImageContextItem.super.prototype.onEditButtonClick.apply( this, arguments );
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.AnnotatedImageContextItem );
