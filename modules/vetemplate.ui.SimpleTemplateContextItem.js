
/**
 * this is the object corresponding to the context popup that appear when click on a template node in VE
 *
 */
/**
 * Context item for a MWTransclusion.
 *
 * @class
 * @extends ve.ui.LinearContextItem
 *
 * @constructor
 * @param {ve.ui.Context} context Context item is in
 * @param {ve.dm.Model} model Model item is related to
 * @param {Object} config Configuration options
 */
ve.ui.SimpleTemplateContextItem = function VeUiSimpleTemplateContextItem() {
	// Parent constructor
	ve.ui.SimpleTemplateContextItem.super.apply( this, arguments );

	// Initialization
	this.$element.addClass( 've-ui-simpleTemplateContextItem' );

	// if i18n message exists for this template, we use it :
	var templateName = ve.ce.MWTransclusionNode.static.getDescription( this.model ).toLowerCase();
	var label = mw.message( 'vetemplate-dialogbutton-template-title-' + templateName );
	if( label.exists() ) {
		this.setLabel( label.text() );
	} else {
		this.setLabel( ve.msg( 'visualeditor-dialogbutton-transclusion-tooltip' ) );
		console.log('message doesn\'t exists : ' + 'vetemplate-dialogbutton-template-title-' + templateName );
	}
};

/* Inheritance */

OO.inheritClass( ve.ui.SimpleTemplateContextItem, ve.ui.LinearContextItem );

//OO.inheritClass( ve.ui.SimpleTemplateContextItem, ve.ui.MWTransclusionContextItem );

/* Static Properties */
ve.ui.SimpleTemplateContextItem.static.name = 'SimpleTemplateContext';

ve.ui.SimpleTemplateContextItem.static.icon = 'template';

// label de la popup de context :
ve.ui.SimpleTemplateContextItem.static.label =
	OO.ui.deferMsg( 'visualeditor-dialogbutton-template-tooltip' );


ve.ui.SimpleTemplateContextItem.static.modelClasses = [ ve.dm.MWTransclusionNode ];

// command name is the command executed on edit click
ve.ui.SimpleTemplateContextItem.static.commandName = 'simpletemplatecommand';
//ve.ui.SimpleTemplateContextItem.static.commandName = 'comment';

/**
 * Only display item for single-template transclusions of these templates.
 *
 * @property {string|string[]|null}
 * @static
 * @inheritable
 */
ve.ui.SimpleTemplateContextItem.static.template = ['Info', 'Idea','Warning'];

/* Static Methods */

/**
 * @static
 * @localdoc Sharing implementation with ve.ui.MWTransclusionDialogTool
 */
ve.ui.SimpleTemplateContextItem.static.isCompatibleWith = function ( model ) {
	var compatible;

	// Parent method
	compatible = ve.ui.MWTransclusionDialogTool.static.isCompatibleWith(model);

	if ( compatible && this.template ) {
		compatible =  model.isSingleTemplate( this.template );
	}

	if(compatible && model.type == "annotatedImageTransclusion") {
		compatible = false;
	}

	return compatible;
};

/* Methods */

/**
 * @inheritdoc
 */
ve.ui.SimpleTemplateContextItem.prototype.getDescription = function () {
	// new description : template text value
	// get the value from the source, in add it into the form
	var surfaceModel = this.context.getSurface().getModel();
	var selection = surfaceModel.getSelection();
	//this.selectedNode.getAttribute( 'mw' );


	// old description : texte including template name :
	return ve.msg(
		'visualeditor-dialog-transclusion-contextitem-description',
		ve.ce.MWTransclusionNode.static.getDescription( this.model ),
		ve.ce.MWTransclusionNode.static.getTemplatePartDescriptions( this.model ).length
	);
};

ve.ui.SimpleTemplateContextItem.static.embeddable = false;
/**
 * @inheritdoc
 */
ve.ui.SimpleTemplateContextItem.prototype.ssonEditButtonClick = function () {
	var surfaceModel = this.context.getSurface().getModel(),
		selection = surfaceModel.getSelection();

	if ( selection instanceof ve.dm.TableSelection ) {
		surfaceModel.setLinearSelection( selection.getOuterRanges()[ 0 ] );
	}

	// Parent method
	ve.ui.SimpleTemplateContextItem.super.prototype.onEditButtonClick.apply( this, arguments );
};

/* Registration */

ve.ui.contextItemFactory.register( ve.ui.SimpleTemplateContextItem );
