/*!
 * VisualEditor UserInterface SimpleTemplate class.
 *
 */

/**
 * SimpleTemplate action.
 *
 * same behaviour than ContentAction, but opens SimpleTemplateInspector when content is inserted
 *
 * @class
 * @extends ve.ui.ContentAction
 * @constructor
 * @param {ve.ui.Surface} surface Surface to act on
 */
ve.ui.SimpleTemplateAction = function VeUiSimpleTemplateAction( surface ) {
	// Parent constructor
	ve.ui.SimpleTemplateAction.super.call( this, surface );
};

/* Inheritance */

OO.inheritClass( ve.ui.SimpleTemplateAction, ve.ui.ContentAction );

/* Static Properties */

ve.ui.ContentAction.static.name = 'simpletemplateaction';

/**
 * List of allowed methods for the action.
 *
 * @static
 * @property
 */
ve.ui.SimpleTemplateAction.static.methods = ve.ui.SimpleTemplateAction.super.static.methods.concat( [  'insert' ] );


/**
 * 
 * @inheritdoc ve.ui.ContentAction
 */
ve.ui.SimpleTemplateAction.prototype.insert = function ( content, annotate, collapseToEnd ) {
	
	// copy to avoid multiple nodes using the same data structure :
	var newContent = ve.copy(content);
	ve.ui.SimpleTemplateAction.super.prototype.insert.apply( this, [newContent, annotate, collapseToEnd] );
	
	this.surface.execute( 'window', 'open', 'simpletemplateinspector' );
	
	return true;
};


/* Registration */

ve.ui.actionFactory.register( ve.ui.SimpleTemplateAction );

