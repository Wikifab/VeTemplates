

/**
 * SimpleTemplate inspector.
 * 
 * the inspector is the edit popup, not the first context popup which appear on clicking a node,
 * but the one which appear by clicking on "edit" button, on the first context popup
 *
 * @class
 * @extends ve.ui.NodeInspector
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.SimpleTemplateInspector = function VeUiSimpleTemplateInspector() {
	// Parent constructor
	ve.ui.SimpleTemplateInspector.super.apply( this, arguments );

	this.transclusionModel = null;
	
};

/* Inheritance */

OO.inheritClass( ve.ui.SimpleTemplateInspector, ve.ui.NodeInspector );

/* Static properties */

ve.ui.SimpleTemplateInspector.static.name = 'simpletemplateinspector';

ve.ui.SimpleTemplateInspector.static.title =
	OO.ui.deferMsg( 'visualeditor-simpletemplateinspector-title' );

ve.ui.SimpleTemplateInspector.static.modelClasses = [ ve.dm.MWTransclusionNode ];

ve.ui.SimpleTemplateInspector.static.size = 'large';

ve.ui.SimpleTemplateInspector.static.actions = [
	{
		action: 'remove',
		label: OO.ui.deferMsg( 'visualeditor-inspector-remove-tooltip' ),
		flags: 'destructive',
		modes: 'edit'
	}
].concat( ve.ui.FragmentInspector.static.actions );

/**
 * Handle frame ready events.
 *
 * @method
 */
ve.ui.SimpleTemplateInspector.prototype.initialize = function () {
	// Parent method
	ve.ui.SimpleTemplateInspector.super.prototype.initialize.call( this );

	this.textWidget = new OO.ui.MultilineTextInputWidget( {
		autosize: true
	} );
	this.textWidget.connect( this, { resize: 'updateSize' } );

	this.$content.addClass( 've-ui-SimpleTemplateInspector-content' );
	this.form.$element.append( this.textWidget.$element );
};

/**
 * @inheritdoc
 */
ve.ui.SimpleTemplateInspector.prototype.getActionProcess = function ( action ) {
	if ( action === 'remove' || action === 'insert' ) {
		return new OO.ui.Process( function () {
			this.close( { action: action } );
		}, this );
	}
	return ve.ui.SimpleTemplateInspector.super.prototype.getActionProcess.call( this, action );
};

/**
 * Handle the inspector being setup.
 *
 * @method
 * @param {Object} [data] Inspector opening data
 * @return {OO.ui.Process}
 */
ve.ui.SimpleTemplateInspector.prototype.getSetupProcessOld = function ( data ) {
	return ve.ui.SimpleTemplateInspector.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			this.getFragment().getSurface().pushStaging();

			this.commentNode = this.getSelectedNode();
			if ( this.commentNode ) {
				this.textWidget.setValue( this.commentNode.getAttribute( 'text' ) || '' );
			} else {
				this.textWidget.setWhitespace( [ ' ', ' ' ] );
				this.getFragment().insertContent( [
					{
						type: 'comment',
						attributes: { text: '' }
					},
					{ type: '/comment' }
				] ).select();
				this.commentNode = this.getSelectedNode();
			}
		}, this );
};


/**
 * Intentionally empty. This is provided for Wikia extensibility.
 */
ve.ui.SimpleTemplateInspector.prototype.initializeTemplateParameters = function () {
	
	// get the value from the source, in add it into the form
	var parts = this.transclusionModel.getParts();
	var model = parts[0];
	// on recupere le nom du parametre, en réalité, il semble que c'est toujours "1"
	var paramName = model.getParameterNames();
	var value = model.getParameter(paramName[0]).getValue();
	this.textWidget.setValue( value );
	// target contain the name of the template :
	//var target = model.getTarget();
};


/**
 * Handle the transclusion being ready to use.
 */
ve.ui.SimpleTemplateInspector.prototype.onTransclusionReady = function () {
	// Add missing required and suggested parameters to each transclusion.
	this.transclusionModel.addPromptedParameters();
	this.loaded = true;
	this.$element.addClass( 've-ui-mwTemplateDialog-ready' );
	
	// what is this for : ? it seem te be to manage multiple params layout, not used here
	//this.$body.append( this.bookletLayout.$element );
	this.popPending();
	//this.bookletLayout.focus( 1 );
};

/**
 * Handle the inspector being setup.
 *
 * @method
 * @param {Object} [data] Inspector opening data
 * @return {OO.ui.Process}
 */
ve.ui.SimpleTemplateInspector.prototype.getSetupProcess = function ( data ) {
	return ve.ui.SimpleTemplateInspector.super.prototype.getSetupProcess.call( this, data )
		.next( function () {
			
			// example from MWTemplateDialog :
			var template, promise;

			// Properties
			this.loaded = false;
			this.altered = false;
			this.transclusionModel = new ve.dm.MWTransclusionModel();

			// Events
			/*this.transclusionModel.connect( this, {
				replace: 'onReplacePart',
				change: 'onTransclusionModelChange'
			} );*/

			// Detach the form while building for performance
			//this.bookletLayout.$element.detach();
			

			// Initialization
			if ( !this.selectedNode ) {
				this.actions.setMode( 'insert' );
				
				if ( data.template ) {
					// New specified template
					template = ve.dm.MWTemplateModel.newFromName(
						this.transclusionModel, data.template
					);
					promise = this.transclusionModel.addPart( template ).done(
						this.initializeNewTemplateParameters.bind( this )
					);
				} else {
					// New template placeholder
					promise = this.transclusionModel.addPart(
						new ve.dm.MWTemplatePlaceholderModel( this.transclusionModel )
					);
				}
			} else {
				this.actions.setMode( 'edit' );
				// Load existing template
				promise = this.transclusionModel
					.load( ve.copy( this.selectedNode.getAttribute( 'mw' ) ) )
					.done( this.initializeTemplateParameters.bind( this ) )
					;
			}
			this.actions.setAbilities( { apply: false, insert: false } );
			this.pushPending();
			promise.always( this.onTransclusionReady.bind( this ) );
			

			this.getFragment().getSurface().pushStaging();

		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.SimpleTemplateInspector.prototype.getReadyProcess = function ( data ) {
	return ve.ui.SimpleTemplateInspector.super.prototype.getReadyProcess.call( this, data )
		.next( function () {
			this.textWidget.focus();
		}, this );
};

/**
 * @inheritdoc
 */
ve.ui.SimpleTemplateInspector.prototype.getTeardownProcess = function ( data ) {
	data = data || {};
	return ve.ui.SimpleTemplateInspector.super.prototype.getTeardownProcess.call( this, data )
		.first( function () {
			var surfaceModel = this.getFragment().getSurface();
			
			// get back the edited text : 
			var textValue = this.textWidget.getValue();

			if ( data.action === 'remove' || textValue === '' ) {
				surfaceModel.popStaging();
				// If popStaging removed the node then this will be a no-op
				this.getFragment().removeContent();
			} else {

				//include textValue into the template model :
				var parts = this.transclusionModel.getParts();
				var model = parts[0];
				var paramNames = model.getParameterNames();
				model.getParameter(paramNames[0]).setValue(textValue);
				// get the template Model value object :
				var obj = this.transclusionModel.getPlainObject();
				
				// edit source node to record the new object value
				this.getFragment().changeAttributes( { mw: obj } );
				surfaceModel.applyStaging();
			}

			// Reset inspector
			this.textWidget.setValue( '' );
		}, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.SimpleTemplateInspector );