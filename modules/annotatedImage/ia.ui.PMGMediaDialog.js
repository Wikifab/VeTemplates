/*!
 * VisualEditor user interface PMGMediaDialog class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * Dialog for inserting and editing MediaWiki media.
 *
 * @class
 * @extends ve.ui.NodeDialog
 *
 * @constructor
 * @param {Object} [config] Configuration options
 */
ve.ui.PMGMediaDialog = function VeUiPMGMediaDialog( config ) {
	// Parent constructor
	ve.ui.PMGMediaDialog.super.call( this, config );

	// Properties
	this.imageModel = null;
	this.pageTitle = '';
	this.isSettingUpModel = false;
	this.isInsertion = false;
	this.selectedImageInfo = null;
	this.searchCache = {};

	this.$element.addClass( 've-ui-mwMediaDialog' );
	this.$element.addClass( 've-ui-pMGMediaDialog' );
};

/* Inheritance */

//OO.inheritClass( ve.ui.PMGMediaDialog, ve.ui.NodeDialog );
OO.inheritClass( ve.ui.PMGMediaDialog, ve.ui.MWMediaDialog );

/* Static Properties */

ve.ui.PMGMediaDialog.static.name = 'media-dialog';

ve.ui.PMGMediaDialog.static.title =
	OO.ui.deferMsg( 'visualeditor-dialog-media-title' );

ve.ui.PMGMediaDialog.static.size = 'large';

ve.ui.PMGMediaDialog.static.actions = [
	{
		action: 'apply',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-apply' ),
		flags: [ 'progressive', 'primary' ],
		modes: 'edit'
	},
	{
		action: 'insert',
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-insert' ),
		flags: [ 'primary', 'progressive' ],
		modes: 'insert'
	},
	{
		action: 'change',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-change-image' ),
		modes: [ 'edit', 'insert' ]
	},
	{
		action: 'choose',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-choose-image' ),
		flags: [ 'primary', 'progressive' ],
		modes: [ 'info' ]
	},
	{
		action: 'upload',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-upload' ),
		flags: [ 'primary', 'progressive' ],
		modes: [ 'upload-upload' ]
	},
	{
		action: 'save',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-save' ),
		flags: [ 'primary', 'progressive' ],
		modes: [ 'upload-info' ]
	},
	{
		action: 'cancelchoose',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-goback' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'info' ]
	},
	{
		action: 'cancelupload',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-goback' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'upload-info' ]
	},
	{
		label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'edit', 'insert', 'select', 'search', 'upload-upload' ]
	},
	{
		action: 'back',
		label: OO.ui.deferMsg( 'visualeditor-dialog-media-goback' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'change' ]
	},
	{
		action: 'annotate',
		label: OO.ui.deferMsg( 'vetemplate-dialog-media-edit-image' ),
		modes: [ 'edit', 'insert' ]
	}
];

ve.ui.PMGMediaDialog.static.modelClasses = [ ve.dm.MWBlockImageNode, ve.dm.MWInlineImageNode ];



/* Methods */

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.getBodyHeight = function () {
	// FIXME: This should vary on panel.
	return 600;
};

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.initialize = function () {
	var altTextFieldset, positionFieldset, borderField, positionField;

	// Parent method
	ve.ui.PMGMediaDialog.super.prototype.initialize.call( this );

/*
	this.panels = new OO.ui.StackLayout();

	// Set up the booklet layout
	this.mediaSettingsBooklet = new OO.ui.BookletLayout( {
		classes: [ 've-ui-mwMediaDialog-panel-settings' ],
		outlined: true
	} );

	this.mediaSearchPanel = new OO.ui.PanelLayout( {
		classes: [ 've-ui-mwMediaDialog-panel-search' ],
		scrollable: true
	} );

	this.mediaUploadBooklet = new mw.ForeignStructuredUpload.BookletLayout( { $overlay: this.$overlay } );

	this.mediaImageInfoPanel = new OO.ui.PanelLayout( {
		classes: [ 've-ui-mwMediaDialog-panel-imageinfo' ],
		scrollable: false
	} );

	this.$infoPanelWrapper = $( '<div>' ).addClass( 've-ui-mwMediaDialog-panel-imageinfo-wrapper' );

	this.generalSettingsPage = new OO.ui.PageLayout( 'general' );
	this.advancedSettingsPage = new OO.ui.PageLayout( 'advanced' );
	this.mediaSettingsBooklet.addPages( [
		this.generalSettingsPage, this.advancedSettingsPage
	] );
	this.generalSettingsPage.getOutlineItem()
		.setIcon( 'parameter' )
		.setLabel( ve.msg( 'visualeditor-dialog-media-page-general' ) );
	this.advancedSettingsPage.getOutlineItem()
		.setIcon( 'parameter' )
		.setLabel( ve.msg( 'visualeditor-dialog-media-page-advanced' ) );

	// Define the media search page
	this.searchTabs = new OO.ui.IndexLayout();

	this.searchTabs.addTabPanels( [
		new OO.ui.TabPanelLayout( 'search', {
			label: ve.msg( 'visualeditor-dialog-media-search-tab-search' )
		} ),
		new OO.ui.TabPanelLayout( 'upload', {
			label: ve.msg( 'visualeditor-dialog-media-search-tab-upload' ),
			content: [ this.mediaUploadBooklet ]
		} )
	] );

	this.search = new mw.widgets.MediaSearchWidget();

	// Define fieldsets for image settings

	// Filename
	this.filenameFieldset = new OO.ui.FieldsetLayout( {
		label: ve.msg( 'visualeditor-dialog-media-content-filename' ),
		icon: 'image'
	} );

	// Caption
	// Set up the caption target
	this.captionTarget = ve.init.target.createTargetWidget( {
		tools: ve.init.target.constructor.static.toolbarGroups,
		includeCommands: this.constructor.static.includeCommands,
		excludeCommands: this.constructor.static.excludeCommands,
		importRules: this.constructor.static.getImportRules(),
		inDialog: this.constructor.static.name,
		multiline: false
	} );
	this.captionFieldset = new OO.ui.FieldsetLayout( {
		$overlay: this.$overlay,
		label: ve.msg( 'visualeditor-dialog-media-content-section' ),
		help: ve.msg( 'visualeditor-dialog-media-content-section-help' ),
		icon: 'parameter',
		classes: [ 've-ui-mwMediaDialog-caption-fieldset' ]
	} );
	this.captionFieldset.$element.append( this.captionTarget.$element );

	// Alt text
	altTextFieldset = new OO.ui.FieldsetLayout( {
		$overlay: this.$overlay,
		label: ve.msg( 'visualeditor-dialog-media-alttext-section' ),
		help: ve.msg( 'visualeditor-dialog-media-alttext-section-help' ),
		icon: 'parameter'
	} );

	this.altTextInput = new OO.ui.TextInputWidget( { spellcheck: true } );

	this.altTextInput.$element.addClass( 've-ui-mwMediaDialog-altText' );

	// Build alt text fieldset
	altTextFieldset.$element
		.append( this.altTextInput.$element );

	// Position
	this.positionSelect = new ve.ui.AlignWidget( {
		dir: this.getDir()
	} );

	this.positionCheckbox = new OO.ui.CheckboxInputWidget();
	positionField = new OO.ui.FieldLayout( this.positionCheckbox, {
		$overlay: this.$overlay,
		align: 'inline',
		label: ve.msg( 'visualeditor-dialog-media-position-checkbox' ),
		help: ve.msg( 'visualeditor-dialog-media-position-checkbox-help' )
	} );

	positionFieldset = new OO.ui.FieldsetLayout( {
		$overlay: this.$overlay,
		label: ve.msg( 'visualeditor-dialog-media-position-section' ),
		help: ve.msg( 'visualeditor-dialog-media-position-section-help' ),
		icon: 'parameter'
	} );

	// Build position fieldset
	positionFieldset.$element.append(
		positionField.$element,
		this.positionSelect.$element
	);

	// Type
	this.typeFieldset = new OO.ui.FieldsetLayout( {
		$overlay: this.$overlay,
		label: ve.msg( 'visualeditor-dialog-media-type-section' ),
		help: ve.msg( 'visualeditor-dialog-media-type-section-help' ),
		icon: 'parameter'
	} );

	this.typeSelectDropdown = new OO.ui.DropdownWidget( { $overlay: this.$overlay } );
	this.typeSelect = this.typeSelectDropdown.getMenu();
	this.typeSelect.addItems( [
		// TODO: Inline images require a bit of further work, will be coming soon
		new OO.ui.MenuOptionWidget( {
			data: 'thumb',
			icon: 'image-thumbnail',
			label: ve.msg( 'visualeditor-dialog-media-type-thumb' )
		} ),
		new OO.ui.MenuOptionWidget( {
			data: 'frameless',
			icon: 'image-frameless',
			label: ve.msg( 'visualeditor-dialog-media-type-frameless' )
		} ),
		new OO.ui.MenuOptionWidget( {
			data: 'frame',
			icon: 'image-frame',
			label: ve.msg( 'visualeditor-dialog-media-type-frame' )
		} ),
		new OO.ui.MenuOptionWidget( {
			data: 'none',
			icon: 'image-none',
			label: ve.msg( 'visualeditor-dialog-media-type-none' )
		} )
	] );
	this.borderCheckbox = new OO.ui.CheckboxInputWidget();
	borderField = new OO.ui.FieldLayout( this.borderCheckbox, {
		align: 'inline',
		label: ve.msg( 'visualeditor-dialog-media-type-border' )
	} );

	borderField.$element.addClass( 've-ui-mwMediaDialog-borderCheckbox' );

	// Build type fieldset
	this.typeFieldset.$element.append(
		this.typeSelectDropdown.$element,
		borderField.$element
	);

	// Size
	this.sizeFieldset = new OO.ui.FieldsetLayout( {
		$overlay: this.$overlay,
		label: ve.msg( 'visualeditor-dialog-media-size-section' ),
		icon: 'parameter',
		help: ve.msg( 'visualeditor-dialog-media-size-section-help' )
	} );

	this.sizeErrorLabel = new OO.ui.LabelWidget( {
		label: ve.msg( 'visualeditor-dialog-media-size-originalsize-error' )
	} );

	this.sizeWidget = new ve.ui.MediaSizeWidget();

	this.$sizeWidgetElements = $( '<div>' ).append(
		this.sizeWidget.$element,
		this.sizeErrorLabel.$element
	);
	this.sizeFieldset.$element.append(
		this.$sizeWidgetElements
	);

	// Events
	this.positionCheckbox.connect( this, { change: 'onPositionCheckboxChange' } );
	this.borderCheckbox.connect( this, { change: 'onBorderCheckboxChange' } );
	this.positionSelect.connect( this, { choose: 'onPositionSelectChoose' } );
	this.typeSelect.connect( this, { choose: 'onTypeSelectChoose' } );
	this.search.getResults().connect( this, { choose: 'onSearchResultsChoose' } );
	this.captionTarget.connect( this, { change: 'checkChanged' } );
	this.altTextInput.connect( this, { change: 'onAlternateTextChange' } );
	this.searchTabs.connect( this, {
		set: 'onSearchTabsSet'
	} );
	this.mediaUploadBooklet.connect( this, {
		set: 'onMediaUploadBookletSet',
		uploadValid: 'onUploadValid',
		infoValid: 'onInfoValid'
	} );

	// Initialization
	this.searchTabs.getTabPanel( 'search' ).$element.append( this.search.$element );
	this.mediaSearchPanel.$element.append( this.searchTabs.$element );
	this.generalSettingsPage.$element.append(
		this.filenameFieldset.$element,
		this.captionFieldset.$element,
		altTextFieldset.$element
	);

	this.advancedSettingsPage.$element.append(
		positionFieldset.$element,
		this.typeFieldset.$element,
		this.sizeFieldset.$element
	);

	this.panels.addItems( [
		this.mediaSearchPanel,
		this.mediaImageInfoPanel,
		this.mediaSettingsBooklet
	] );

	this.$body.append( this.panels.$element );

*/

	var currentPanel = this.panels.getCurrentItem();

	this.mediaImageAnnotationPanel = new OO.ui.PanelLayout( {
		classes: [ 've-ui-mwMediaDialog-panel-imageannotation' ],
		scrollable: false
	} );
	this.panels.addItems(this.mediaImageAnnotationPanel);

	if (this.mediaImageAnnotationPanel.isVisible()) {
		this.mediaImageAnnotationPanel.toggle();
	}
	this.panels.setItem(currentPanel);

};

/**
 * Handle set events from the search tabs
 *
 * @param {OO.ui.TabPanelLayout} tabPanel Current tabPanel
 */
ve.ui.PMGMediaDialog.prototype.onSearchTabsSet = function ( tabPanel ) {
	var name = tabPanel.getName();

	this.actions.setMode( name );

	switch ( name ) {
		case 'search':
			this.setSize( 'larger' );
			break;

		case 'upload':
			this.setSize( 'medium' );
			this.uploadPageNameSet( 'upload' );
			break;
	}
};



/**
 * Fetch a bigger image thumbnail from the API.
 *
 * @param {string} imageName Image source
 * @param {Object} dimensions Image dimensions
 * @return {jQuery.Promise} Thumbnail promise that resolves with new thumb url
 */
ve.ui.PMGMediaDialog.prototype.fetchThumbnail = function ( imageName, dimensions ) {
	var dialog = this,
		apiObj = {
			action: 'query',
			prop: 'imageinfo',
			indexpageids: '1',
			iiprop: 'url',
			titles: imageName
		};

	// Check cache first
	if ( this.searchCache[ imageName ] ) {
		return $.Deferred().resolve( this.searchCache[ imageName ] );
	}

	if ( dimensions.width ) {
		apiObj.iiurlwidth = dimensions.width;
	}
	if ( dimensions.height ) {
		apiObj.iiurlheight = dimensions.height;
	}
	return new mw.Api().get( apiObj )
		.then( function ( response ) {
			var thumburl = ve.getProp(
				response.query.pages[ response.query.pageids[ 0 ] ],
				'imageinfo',
				0,
				'thumburl'
			);
			// Cache
			dialog.searchCache[ imageName ] = thumburl;
			return thumburl;
		} );
};


/**
 * Handle new image being chosen.
 *
 * @param {mw.widgets.MediaResultWidget|null} item Selected item
 */
ve.ui.PMGMediaDialog.prototype.confirmSelectedImage = function () {
	var title, imageTitleText,
		obj = {},
		info = this.selectedImageInfo;

	if ( info ) {
		imageTitleText = info.title || info.canonicaltitle;
		// Run title through mw.Title so the File: prefix is localised
		title = mw.Title.newFromText( imageTitleText ).getPrefixedText();
		if ( !this.imageModel ) {
			// Create a new image model based on default attributes
			this.imageModel = ve.dm.MWImageModel.static.newFromImageAttributes(
				{
					// Per https://www.mediawiki.org/w/?diff=931265&oldid=prev
					href: './' + title,
					src: info.url,
					resource: './' + title,
					width: info.thumbwidth,
					height: info.thumbheight,
					mediaType: info.mediatype,
					type: 'thumb',
					align: 'default',
					defaultSize: true
				},
				this.getFragment().getDocument()
			);
			this.attachImageModel();
			this.resetCaption();
		} else {
			// Update the current image model with the new image source
			this.imageModel.changeImageSource(
				{
					mediaType: info.mediatype,
					href: './' + title,
					src: info.url,
					resource: './' + title
				},
				info
			);
			// Update filename
			this.filenameFieldset.setLabel(
				$( '<span>' ).append(
					document.createTextNode( this.imageModel.getFilename() + ' ' ),
					$( '<a>' )
						.addClass( 'visualeditor-dialog-media-content-description-link' )
						.attr( 'href', mw.util.getUrl( title ) )
						.attr( 'target', '_blank' )
						.attr( 'rel', 'noopener' )
						.text( ve.msg( 'visualeditor-dialog-media-content-description-link' ) )
				)
			);
		}

		// Cache
		// We're trimming the stored data down to be consistent with what
		// ImageInfoCache.getRequestPromise fetches.
		obj[ imageTitleText ] = {
			size: info.size,
			width: info.width,
			height: info.height,
			mediatype: info.mediatype
		};
		ve.init.platform.imageInfoCache.set( obj );

		this.checkChanged();
		this.switchPanels( 'edit' );
	}
};


/**
 * When changes occur, enable the apply button.
 */
ve.ui.PMGMediaDialog.prototype.checkChanged = function () {
	var captionChanged = false;

	// Only check 'changed' status after the model has finished
	// building itself
	if ( !this.isSettingUpModel ) {
		captionChanged = !!this.captionTarget && this.captionTarget.hasBeenModified();

		if (
			// Activate or deactivate the apply/insert buttons
			// Make sure sizes are valid first
			this.sizeWidget.isValid() &&
			(
				// Check that the model or caption changed
				this.isInsertion && this.imageModel ||
				captionChanged ||
				this.imageModel.hasBeenModified()
			)
		) {
			this.actions.setAbilities( { insert: true, apply: true } );
		} else {
			this.actions.setAbilities( { insert: false, apply: false } );
		}
	}
};


/**
 * Switch between the edit and insert/search panels
 *
 * @param {string} panel Panel name
 * @param {boolean} [stopSearchRequery] Do not re-query the API for the search panel
 */
ve.ui.MWMediaDialog.prototype.switchPanels = function ( panel, stopSearchRequery ) {
	var dialog = this;
	switch ( panel ) {
		case 'edit':
			this.setSize( 'large' );
			// Set the edit panel
			this.panels.setItem( this.mediaSettingsBooklet );
			// Focus the general settings page
			this.mediaSettingsBooklet.setPage( 'general' );
			// Hide/show buttons
			this.actions.setMode( this.selectedNode ? 'edit' : 'insert' );
			// Focus the caption surface
			this.captionTarget.focus();
			break;
		case 'search':
			this.setSize( 'larger' );
			this.selectedImageInfo = null;
			if ( !stopSearchRequery ) {
				this.search.getQuery().setValue( dialog.pageTitle );
				this.search.getQuery().focus().select();
			}
			// Set the edit panel
			this.panels.setItem( this.mediaSearchPanel );
			this.searchTabs.setTabPanel( 'search' );
			this.searchTabs.toggleMenu( true );
			this.actions.setMode( this.imageModel ? 'change' : 'select' );
			// Layout pending items
			this.search.runLayoutQueue();
			break;
		case 'annotate':
			console.log('switch panel annotate');
			this.setSize( 'larger' );
			// Set the edit panel
			// TODO ...
			this.panels.setItem( this.mediaImageAnnotationPanel );
			// Hide/show buttons
			this.actions.setMode( this.selectedNode ? 'edit' : 'insert' );
			break;
		default:
		case 'imageInfo':
			this.setSize( 'larger' );
			// Hide/show buttons
			this.actions.setMode( 'info' );
			// Hide/show the panels
			this.panels.setItem( this.mediaImageInfoPanel );
			break;
	}
	this.currentPanel = panel || 'imageinfo';
};

/**
 * Attach the image model to the dialog
 */
ve.ui.PMGMediaDialog.prototype.attachImageModel = function () {
	if ( this.imageModel ) {
		this.imageModel.disconnect( this );
		this.sizeWidget.disconnect( this );
	}

	// Events
	this.imageModel.connect( this, {
		alignmentChange: 'onImageModelAlignmentChange',
		typeChange: 'onImageModelTypeChange',
		sizeDefaultChange: 'checkChanged'
	} );

	// Set up
	// Ignore the following changes in validation while we are
	// setting up the initial tools according to the model state
	this.isSettingUpModel = true;

	// Filename
	this.filenameFieldset.setLabel(
		$( '<span>' ).append(
			document.createTextNode( this.imageModel.getFilename() + ' ' ),
			$( '<a>' )
				.addClass( 'visualeditor-dialog-media-content-description-link' )
				.attr( 'href', mw.util.getUrl( this.imageModel.getResourceName() ) )
				.attr( 'target', '_blank' )
				.attr( 'rel', 'noopener' )
				.text( ve.msg( 'visualeditor-dialog-media-content-description-link' ) )
		)
	);

	// Size widget
	this.sizeErrorLabel.toggle( false );
	this.sizeWidget.setScalable( this.imageModel.getScalable() );
	this.sizeWidget.connect( this, {
		changeSizeType: 'checkChanged',
		change: 'checkChanged',
		valid: 'checkChanged'
	} );

	// Initialize size
	this.sizeWidget.setSizeType( this.imageModel.isDefaultSize() ? 'default' : 'custom' );
	this.sizeWidget.setDisabled( this.imageModel.getType() === 'frame' );

	// Update default dimensions
	this.sizeWidget.updateDefaultDimensions();

	// Set initial alt text
	this.altTextInput.setValue( this.imageModel.getAltText() );

	// Set initial alignment
	this.positionSelect.setDisabled( !this.imageModel.isAligned() );
	this.positionSelect.selectItemByData( this.imageModel.isAligned() && this.imageModel.getAlignment() );
	this.positionCheckbox.setSelected( this.imageModel.isAligned() );

	// Border flag
	this.borderCheckbox.setDisabled( !this.imageModel.isBorderable() );
	this.borderCheckbox.setSelected( this.imageModel.isBorderable() && this.imageModel.hasBorder() );

	// Type select
	this.typeSelect.selectItemByData( this.imageModel.getType() || 'none' );

	this.isSettingUpModel = false;
};

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.getActionProcess = function ( action ) {
	var handler;

	console.log ("get action process : " + action);
	switch ( action ) {
		case 'change':
			handler = function () {
				this.switchPanels( 'search' );
			};
			break;
		case 'back':
			handler = function () {
				this.switchPanels( 'edit' );
			};
			break;
		case 'choose':
			handler = function () {
				this.confirmSelectedImage();
				this.switchPanels( 'edit' );
			};
			break;
		case 'cancelchoose':
			handler = function () {
				this.switchPanels( 'search', true );
				// Reset upload booklet, in case we got here by uploading a file
				return this.mediaUploadBooklet.initialize();
			};
			break;
		case 'cancelupload':
			handler = function () {
				this.searchTabs.setTabPanel( 'upload' );
				this.searchTabs.toggleMenu( true );
				return this.mediaUploadBooklet.initialize();
			};
			break;
		case 'upload':
			return new OO.ui.Process( this.mediaUploadBooklet.uploadFile() );
		case 'save':
			return new OO.ui.Process( this.mediaUploadBooklet.saveFile() );
		case 'apply':
		case 'insert':
			handler = function () {
				var surfaceModel = this.getFragment().getSurface();

				// Update from the form
				this.imageModel.setAltText( this.altTextInput.getValue() );
				this.imageModel.setCaptionDocument(
					this.captionTarget.getSurface().getModel().getDocument()
				);

				if (
					// There was an initial node
					this.selectedNode &&
					// And we didn't change the image type block/inline or vice versa
					this.selectedNode.type === this.imageModel.getImageNodeType() &&
					// And we didn't change the image itself
					this.selectedNode.getAttribute( 'src' ) ===
						this.imageModel.getImageSource()
				) {
					// We only need to update the attributes of the current node
					this.imageModel.updateImageNode( this.selectedNode, surfaceModel );
				} else {
					// Replacing an image or inserting a brand new one
					this.fragment = this.imageModel.insertImageNode( this.getFragment() );
				}

				this.close( { action: action } );
			};
			break;
		case 'annotate':
			handler = function () {
				this.switchPanels( 'annotate', true );
			};
			break;
		default:
			return ve.ui.PMGMediaDialog.super.prototype.getActionProcess.call( this, action );
	}

	return new OO.ui.Process( handler, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.PMGMediaDialog );
