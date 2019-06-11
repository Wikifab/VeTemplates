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
	this.sourceImage = '';
	this.dataJsonModel = '';
	this.thumbUrl = null;
	this.pageTitle = '';
	this.isSettingUpModel = false;
	this.isInsertion = false;
	this.selectedImageInfo = null;
	this.searchCache = {};
	this.jsonDataHasBeenModified = false;
	this.waitingGeneration = false;
	this.widthLimit = 1094;

	this.$element.addClass( 've-ui-mwMediaDialog' );
	this.$element.addClass( 've-ui-pMGMediaDialog' );

	// load annotatedImage librairy :
	mw.loader.load( 'ext.imageannotator.editor');
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
		label: OO.ui.deferMsg( 'vetemplate-dialog-annotatedimage-editbutton' ),
		modes: [ 'edit', 'insert' ]
	},
	{
		action: 'annotate-back',
		label: OO.ui.deferMsg( 'vetemplate-dialog-annotatedimage-cancel-annotate' ),
		flags: [ 'safe', 'back' ],
		modes: [ 'edit-annotate', 'insert-annotate' ]
	},
	{
		action: 'annotate-save',
		label: OO.ui.deferMsg( 'imageannotator-button-save' ),
		flags: [ 'primary', 'progressive' ],
		modes: [ 'edit-annotate', 'insert-annotate' ]
	}
];

ve.ui.PMGMediaDialog.static.modelClasses = [ ve.dm.AnnotatedImageTransclusionNode, ve.dm.MWBlockImageNode, ve.dm.MWInlineImageNode ];



/* Methods */

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.getBodyHeight = function () {
	// FIXME: This should vary on panel.
	return 600;
};

ve.ui.PMGMediaDialog.prototype.getJsonData = function () {
	return this.dataJsonModel;
}

ve.ui.PMGMediaDialog.prototype.setJsonData = function (jsonData) {
	this.dataJsonModel = jsonData;
}
ve.ui.PMGMediaDialog.prototype.jsonDataHasBeenModified = function () {
	return this.jsonDataHasBeenModified;
}
ve.ui.PMGMediaDialog.prototype.setCaption = function (caption) {
	this.caption = caption;
	this.simpleCaptionTextInput.setValue( caption);

}

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.initialize = function () {
	var altTextFieldset, positionFieldset, borderField, positionField;

	//console.log("PMGMediaDialog.prototype.initialize");

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

	// replace mediaUploadBooklet  :
	this.mediaUploadBooklet = new mw.VeTemplateUpload.BookletLayout( { $overlay: this.$overlay } );

	this.mediaUploadBooklet.connect( this, {
		set: 'onMediaUploadBookletSet',
		uploadValid: 'onUploadValid',
		infoValid: 'onInfoValid',
		fileUploaded: 'onFileUploaded'
	} );

	this.mediaUploadBooklet.connect( this, {
		infoValid: 'onInfoValidCheckName'
	} );

	this.buildPMGSearchPanel();


	// we replace Caption field by an simpler one :
	this.simpleCaptionTextInput = new OO.ui.TextInputWidget( { spellcheck: true } );

	this.simpleCaptionTextInput.$element.addClass( 've-ui-mwMediaDialog-altText' );

	this.captionFieldset.$element.children('.oo-ui-widget').hide();
	this.captionFieldset.$element.append(this.simpleCaptionTextInput.$element);

	this.simpleCaptionTextInput.connect( this, { change: 'onSimpleCaptionTextChange' } );


	this.$imageEditorPanelWrapper = $( '<div>' ).addClass( 've-ui-mwMediaDialog-panel-imageeditor-wrapper' );


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
 * Handle panelNameSet events from the upload stack
 *
 * @param {OO.ui.PageLayout} page Current page
 */
ve.ui.PMGMediaDialog.prototype.onMediaUploadBookletSet = function ( page ) {
	this.uploadPageNameSet( page.getName() );
};

/**
 * The upload booklet's page name has changed
 *
 * @param {string} pageName Page name
 */
ve.ui.PMGMediaDialog.prototype.uploadPageNameSet = function ( pageName ) {
	var imageInfo;
	if ( pageName === 'insert' ) {

		var mediaUploadBooklet = this.mediaUploadBooklet,
			upload = mediaUploadBooklet.upload,
			state = upload.getState(),
			stateDetails = upload.getStateDetails();

		// file exists : let the user decide whether to use the existing file
		if (state === mw.Upload.State.WARNING && stateDetails.fileexists != undefined) {
			imageInfo = stateDetails.existingfile;
			this.chooseExistingImageInfo( imageInfo );
		} else { // uploaded file
			imageInfo = this.mediaUploadBooklet.upload.getImageInfo();
			this.chooseImageInfo( imageInfo );
		}
	} else {
		// Hide the tabs after the first page
		this.searchTabs.toggleMenu( pageName === 'upload' );

		this.actions.setMode( 'upload-' + pageName );
	}
};

ve.ui.PMGMediaDialog.prototype.buildPMGSearchPanel = function () {

	// we remove originals tabs (search an upload) to replace by others :
	this.searchTabs.clearTabPanels();
	this.searchTabs.addTabPanels( [
		new OO.ui.TabPanelLayout( 'search', {
			label: ve.msg( 'visualeditor-dialog-media-search-tab-search' )
		} )
	] );

	var searchWidget = new ve.ui.PmgSearchWidget();

	searchWidget.getResults().connect( this, { choose: 'onSearchResultsChoose' } );

	this.searchTabs.getTabPanel( 'search' ).$element.append( searchWidget.$element );

	this.searchTabs.addTabPanels( [
		new OO.ui.TabPanelLayout( 'upload', {
			label: ve.msg( 'visualeditor-dialog-media-search-tab-upload' ),
			content: [ this.mediaUploadBooklet ]
		} )
	] );
}


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


ve.ui.MWMediaDialog.prototype.onFileUploaded = function (  ) {
	/*console.log("e.ui.MWMediaDialog.prototype.onFileUploaded");

	// change filename, to prefix with page name :
	var filename = this.mediaUploadBooklet.getFilename();
	console.log(filename);

	filename = mw.config.get('wgPageName').replace(/(.*)\//g,"").replace(":","-") + '_' + filename;

	filename = this.sanitizeFilename(filename);

	var filename = this.mediaUploadBooklet.setFilename(filename);
	console.log(filename);*/

	this.mediaUploadBooklet.generateFilename(this.mediaUploadBooklet.getFilename());
	return true;
};

ve.ui.MWMediaDialog.prototype.onInfoValidCheckName = function ( isValid ) {
	// hack : check filename to remove specialChars "'"
	// this should be done somewhere else, but we should change mw widget

	//TODO : here we add pagename as prefix, but only if invald chars are found

	var filename = this.mediaUploadBooklet.filenameWidget.getValue();
	var invaliCharRegex = new RegExp('[\'\"]+', 'g');
	var invaliCharStrictRegex = new RegExp('[^ a-zA-Z_0-9]+', 'g');

	if (filename.match(invaliCharRegex)) {
		var pageName = mw.config.get('wgPageName');

		pageName = pageName.replace(invaliCharStrictRegex,'');
		pageName = pageName.replace(invaliCharRegex,'');
		filename = filename.replace(invaliCharRegex,'');

		if (filename.search(filename) != -1 && filename.length < 50) {
			filename = pageName + '_' + filename;
		}

		this.mediaUploadBooklet.filenameWidget.setValue(filename);
	}
	return true;
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
 * Build the image info panel from the information in the API.
 * Use the metadata info if it exists.
 * Note: Some information in the metadata object needs to be safely
 * stripped from its html wrappers.
 *
 * @param {Object} imageinfo Image info
 */
ve.ui.PMGMediaDialog.prototype.buildImageEditorPanel = function ( imageinfo ) {

	this.$imageEditorPanelWrapper.empty();

	//console.log("PMGMediaDialog.prototype.buildImageEditorPanel ");
	//console.log(imageinfo);

	// hack : if no image info, we build one :
	// (case when editing an existing image)
	if (! imageinfo) {
		imageinfo = {};
		imageinfo.title = this.imageModel.getFilename();
		imageinfo.extmetadata = '';
		imageinfo.url = this.imageModel.imageSrc ? this.imageModel.imageSrc: this.imageModel.url;
		imageinfo.thumburl = imageinfo.url;
		if (this.imageModel.getCurrentDimensions()) {
			imageinfo.width = this.imageModel.getCurrentDimensions().width;
			imageinfo.height = this.imageModel.getCurrentDimensions().height;

		} else {
			console.log('Warning : no current dimension');
		}
	}
	//console.log(imageinfo);

	var imageTitleText = imageinfo.title || imageinfo.canonicaltitle,
		imageTitle = new OO.ui.LabelWidget( {
			label: mw.Title.newFromText( imageTitleText ).getNameText()
		} ),
		metadata = imageinfo.extmetadata,
		// Field configuration (in order)
		fileType = this.getFileType( imageinfo.url );

	var	$thumbContainer = $( '<div>' )
			.css("display","none")
			.addClass( 've-ui-mwMediaDialog-panel-imageeditor-thumb' ),
		$main = $( '<div>' )
			.addClass( 've-ui-mwMediaDialog-panel-imageeditor-main' ),
		$image = $( '<img>' ).addClass('imageeditor-sourceimg'),
		$editorContainer = $( '<div>' ).addClass('imageeditor-editorContainer');

	// Main section - title
	$main.append(
		imageTitle.$element
			.addClass( 've-ui-mwMediaDialog-panel-imageeditor-title' )
	);


	// Build fields containing data :
	var imageField = $('<input type="hidden" name="VEPMGimageeditor_imgTitle">');
	var dataField = $('<input type="hidden" name="VEPMGimageeditor_data">');
	var $fields = $( '<div>' )
		.addClass( 've-ui-mwMediaDialog-panel-imageeditor-editor' )
		.append(
				imageField, dataField, $editorContainer
		);

	// Initialize thumb container
	$thumbContainer
		.append( $image.prop( 'src', imageinfo.thumburl ) );

	this.$editorContainer = $editorContainer;


	this.$imageEditorPanelWrapper.append(
		$thumbContainer,
		$fields
	);

	// Force a scrollbar to the screen before we measure it
	this.mediaImageAnnotationPanel.$element.css( 'overflow-y', 'scroll' );
	windowWidth = this.mediaImageAnnotationPanel.$element.width();

	// Define thumbnail size
	// For regular images, calculate a bigger image dimensions
	var imgWidth = windowWidth ? windowWidth : 600;
	newDimensions = ve.dm.MWImageNode.static.resizeToBoundingBox(
		// Original image dimensions
		{
			width: imageinfo.width,
			height: imageinfo.height
		},
		// Bounding box -- the size of the dialog, minus padding
		{
			width: imgWidth,
			//width: ext_imageAnnotator.standardWidth,
			height: this.getBodyHeight() - 120
		}
	);

	// Resize the image
	$image.css( {
		width: newDimensions.width,
		height: newDimensions.height
	} );

	// Call for a bigger image
	this.fetchThumbnail( imageTitleText, newDimensions )
		.done( function ( thumburl ) {
			if ( thumburl ) {
				$image.prop( 'src', thumburl );
			}
		} );

	isPortrait = newDimensions.width < ( windowWidth * 3 / 5 );
	this.mediaImageAnnotationPanel.$element.toggleClass( 've-ui-mwMediaDialog-panel-imageinfo-portrait', isPortrait );
	this.mediaImageAnnotationPanel.$element.append( this.$imageEditorPanelWrapper );
	//if ( isPortrait ) {
	//	$info.outerWidth( Math.floor( windowWidth - $thumbContainer.outerWidth( true ) - 15 ) );
	//}

	// Let the scrollbar appear naturally if it should
	this.mediaImageAnnotationPanel.$element.css( 'overflow', '' );
};

/**
 * Choose image info for editing
 *
 * @param {Object} info Image info
 */
ve.ui.PMGMediaDialog.prototype.chooseExistingImageInfo = function ( info ) {

	this.$infoPanelWrapper.empty();

	this.$infoPanelWrapper.append('<div class="fileexists">' + ve.msg( 'pmgmediadialog-fileexists' ) + '</div>' );
	// Switch panels
	this.selectedImageInfo = info;
	this.switchPanels( 'imageInfo' );
	// Build info panel
	this.buildMediaInfoPanel( info );
	// Build editor panel
	this.buildImageEditorPanel( info );

};

/**
 * Choose image info for editing
 *
 * @param {Object} info Image info
 */
ve.ui.PMGMediaDialog.prototype.chooseImageInfo = function ( info ) {

	this.$infoPanelWrapper.empty();
	// Switch panels
	this.selectedImageInfo = info;
	this.switchPanels( 'imageInfo' );
	// Build info panel
	this.buildMediaInfoPanel( info );
	// Build editor panel
	this.buildImageEditorPanel( info );
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

			var width = Math.min(info.width, this.widthLimit);
			var height = Math.round(info.height * (/* scale */width / info.width));

			// Create a new image model based on default attributes
			this.imageModel = ve.dm.MWImageModel.static.newFromImageAttributes(
				{
					// Per https://www.mediawiki.org/w/?diff=931265&oldid=prev
					href: './' + title,
					src: info.url,
					resource: './' + title,
					width: width,
					height: height,
					mediaType: info.mediatype,
					type: 'frameless',
					align: 'center',
					defaultSize: false
				},
				this.getFragment().getDocument()
			);
			this.attachImageModel();
			this.resetCaption();

			this.sourceImage = info.url;
			this.dataJsonModel = '';
			this.hash = '';
			this.thumbUrl = null;
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
			this.sourceImage = info.url;
			this.dataJsonModel = '';
			this.hash = '';
			this.thumbUrl = null;
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


	if ( this.waitingGeneration) {
		// if annotated image generation is running, do not allow insert/apply
		this.actions.setAbilities( { insert: false, apply: false } );
		return;
	}

	// Only check 'changed' status after the model has finished
	// building itself
	if ( !this.isSettingUpModel ) {
		captionChanged = !!this.captionTarget && this.captionTarget.hasBeenModified();

		if (
			// Activate or deactivate the apply/insert buttons
			// Make sure sizes are valid first
			// we do not check size, because it causse issue when crop has changed ratio
			//this.sizeWidget.isValid() &&
			(
				// Check that the model or caption changed
				this.isInsertion && this.imageModel ||
				captionChanged ||
				this.imageModel.hasBeenModified() ||
				this.jsonDataHasBeenModified||
				this.captionHasBeenModified
			)
		) {
			this.actions.setAbilities( { insert: true, apply: true } );
		} else {
			this.actions.setAbilities( { insert: false, apply: false } );
		}
	}
};


ve.ui.PMGMediaDialog.prototype.startImageEditor = function () {
	var mediaDialog = this;

	//var img = this.$imageEditorPanelWrapper.find('img.imageeditor-sourceimg').first();

	var img = $('<img src="' + this.sourceImage + '">');

	var editorObject = null;

	var thumbGenerated = function  (url, thumbData) {
		// TODO : change img src attribut
		//mediaDialog.imageModel.setThumbUrl(url);
		mediaDialog.imageModel.imageSrc = url;
		mediaDialog.hash = thumbData.hash;
		mediaDialog.waitingGeneration = false;
		mediaDialog.checkChanged();
	}

	var updateCallback = function (editor, jsondata) {
		mediaDialog.dataJsonModel = jsondata;
		mediaDialog.setJsonData(jsondata);
		mediaDialog.jsonDataHasBeenModified = true;

		editorObject = editor;
		mediaDialog.waitingGeneration = true;
		editor.generateThumb(thumbGenerated);

		mediaDialog.checkChanged();
		mediaDialog.switchPanels( 'edit' );
	}
	var cancelCallback = function (editor) {

		console.log("PMG cancelcallback");
		mediaDialog.checkChanged();
		mediaDialog.switchPanels( 'edit' );
	}

	var currentDim = this.imageModel.getCurrentDimensions();

	var options = [];
	options['no-controlbar'] = true;
	options['custom-dimensions'] = currentDim;
	options['free-cropping'] = true;

	this.imageAnnotationEditor = mw.ext_imageAnnotator.createNewEditor(this.$editorContainer, img, this.getJsonData(), updateCallback, options);

}


ve.ui.PMGMediaDialog.prototype.getCaptionFromAttributes = function (attrs) {

	var index = 0;

	if (typeof attrs.caption !== 'undefined') {
		return attrs.caption;
	}

	// look for last numeric index
	// this should be done only for original Image Model
	while( attrs[index] != undefined) {
		index = index + 1;
	}
	index = index - 1;

	if (index >= 0) {
		return attrs[index];
	}
	return '';
}

ve.ui.PMGMediaDialog.prototype.getModelAttributesFromNode = function (selectedNode) {
	// should be :
	// atrts = selectedNode.getAttributes();

	var elemAtri = selectedNode.getAttributes();
	var attrs = {};


	if (elemAtri.mw && elemAtri.mw.parts && elemAtri.mw.parts[0] ) {
		var template = elemAtri.mw.parts[0].template;
		if (template.params && template.target) {
			//attrs = template.params;
			var target = template.target.wt;
			attrs.resource = target.replace('#annotatedImageLight:','');

			for (var attrname in template.params ) {
				// TODO : set attribut in wt
				attrs[attrname] = template.params[attrname].wt;
				elemAtri[attrname] = template.params[attrname].wt;
			}
		} else {

			console.log('getModelAttributesFromNode FAIL');
			console.log(template);
			attrs = elemAtri;
		}
	} else {
		attrs = elemAtri;
	}
	if (! elemAtri.src && elemAtri.sourceimage) {
		elemAtri.src = elemAtri.sourceimage;
	}
	elemAtri.caption = this.getCaptionFromAttributes(elemAtri);
	Object.assign(attrs, elemAtri);
	/*
	 *
	 if (attrs.size && attrs.width == null) {
		attrs.width = attrs.size.replace('px', '');
		if(attrs.height == null) {
			delete attrs.height;
		}
	}
	*/

	return attrs;
}



/**
 * get image model from a node
 * node can be BlockImageNode or AnnotatedImageTransclusion
 */
ve.ui.PMGMediaDialog.prototype.setModelFromNode = function ( selectedNode) {

	switch(selectedNode.type) {
		case 'annotatedImageTransclusion' :
			var attrs = this.getModelAttributesFromNode(selectedNode);
			this.imageModel = ve.dm.MWImageModel.static.newFromImageAttributes( attrs, selectedNode.getDocument() )
			//this.imageModel = ve.dm.MWImageModel.static.newFromImage( this.selectedNode );
			attributes = this.selectedNode.getAttributes();
			this.setJsonData(attrs.jsondata);
			this.setCaption(attrs.caption);
			// TODO : check hash value here
			this.hash = attrs.hash;
			this.sourceImage = attributes.sourceimage ? attributes.sourceimage : this.imageModel.imageSrc ;
			this.jsonDataHasBeenModified = false;
			this.captionHasBeenModified = false;
			break;
		case 'image' :
			this.imageModel = ve.dm.MWImageModel.static.newFromImageNode( this.selectedNode );
			this.setJsonData('');
			this.caption = '';
			this.hash = '';
			this.jsonDataHasBeenModified = false;
			this.captionHasBeenModified = false;
			break;
		case 'mwBlockImage' :
		case 'mwInlineImage' :
			this.imageModel = ve.dm.MWImageModel.static.newFromImageNode( this.selectedNode );
			this.setJsonData('');
			this.caption = '';
			this.hash = '';
			this.sourceImage = this.imageModel.imageSrc ;
			this.jsonDataHasBeenModified = false;
			this.captionHasBeenModified = false;
			break;
		default :
			console.log('PMGMediaDialog.prototype.getModelFromNode : unknown type');
			console.log(selectedNode);
			throw new Exception('Node type invalid');
	}
	return this.imageModel;
}

/**
 * Handle image model type change
 *
 * @param {string} type Image type
 */
ve.ui.PMGMediaDialog.prototype.onSimpleCaptionTextChange = function ( value ) {

	this.caption = value;
	this.captionHasBeenModified = true;

	this.checkChanged();
};

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.getSetupProcess = function ( data ) {

	return ve.ui.MWMediaDialog.super.prototype.getSetupProcess.call( this, data )
		.next( function () {

			var
				dialog = this,
				pageTitle = mw.config.get( 'wgTitle' ),
				namespace = mw.config.get( 'wgNamespaceNumber' ),
				namespacesWithSubpages = mw.config.get( 'wgVisualEditorConfig' ).namespacesWithSubpages;

			// Read the page title
			if ( namespacesWithSubpages[ namespace ] ) {
				// If we are in a namespace that allows for subpages, strip the entire
				// title except for the part after the last /
				pageTitle = pageTitle.slice( pageTitle.lastIndexOf( '/' ) + 1 );
			}
			this.pageTitle = pageTitle;

			// Set language for search results
			this.search.setLang( this.getFragment().getDocument().getLang() );


			var fragment = this.getFragment();


			if ( this.selectedNode ) {
				// TODO : selected Node is the dm annotatedImageTransclusion, we must find the image included


				this.isInsertion = false;
				// Create image model
				this.setModelFromNode(this.selectedNode);
				if (this.imageModel.attributesCache.size) {
					// fix issue : dimension bug when empty :
					var scalableObject = this.imageModel.getScalable();
					if (! scalableObject.getCurrentDimensions()) {
						var ratio = scalableObject.ratio || 0.75;
						var dim = {
								width: parseInt(this.imageModel.attributesCache.size.replace('px','')),
								height: 300
						}
						dim.height = parseInt(dim.width * ratio);
						console.log("fix dimensions : ");
						console.log(dim);
						scalableObject.setCurrentDimensions(dim);
					}
				}
				this.attachImageModel();

				if ( !this.imageModel.isDefaultSize() ) {
					// To avoid dirty diff in case where only the image changes,
					// we will store the initial bounding box, in case the image
					// is not defaultSize
					this.imageModel.setBoundingBox( this.imageModel.getCurrentDimensions() );
				}
				// Store initial hash to compare against
				this.imageModel.storeInitialHash( this.imageModel.getHashObject() );

				this.buildImageEditorPanel()
			} else {
				this.isInsertion = true;
			}

			this.search.setup();

			this.resetCaption();

			// Reset upload booklet
			// The first time this is called, it will try to switch panels,
			// so the this.switchPanels() call has to be later.
			return this.mediaUploadBooklet.initialize().then( function () {
				dialog.actions.setAbilities( { upload: false, save: false, insert: false, apply: false } );

				if ( data.file ) {
					dialog.searchTabs.setTabPanel( 'upload' );
					dialog.mediaUploadBooklet.setFile( data.file );
				}
			} );
		}, this );
};

/**
 * Switch between the edit and insert/search panels
 *
 * @param {string} panel Panel name
 * @param {boolean} [stopSearchRequery] Do not re-query the API for the search panel
 */
ve.ui.PMGMediaDialog.prototype.switchPanels = function ( panel, stopSearchRequery ) {
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
			this.setSize( 'full' );
			// Set the edit panel
			this.panels.setItem( this.mediaImageAnnotationPanel );
			// Hide/show buttons
			this.actions.setMode( this.selectedNode ? 'edit-annotate' : 'insert-annotate' );
			this.startImageEditor();
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


ve.ui.PMGMediaDialog.prototype.getCurrentDimensions = function () {
	//this call this.imageModel.scalable.getCurrentDimensions();
	var result = this.imageModel.getCurrentDimensions();

	if (result == null) {
		// we should let this empty, to set size widget to 'default' size
		// but this mays produce bugs when size is empty
		result = {
			width: this.widthLimit,
			height: 821
		}
		if (this.selectedImageInfo && this.selectedImageInfo.width) {
			result.width = this.selectedImageInfo.width;
		}
		if (this.selectedImageInfo && this.selectedImageInfo.height) {
			result.height = this.selectedImageInfo.height;
		}
	}
	if ( ! result.width) {
		console.log('getCurrentDimensions set missing width');
		result.width = this.widthLimit;
	}
	if ( ! result.height) {
		console.log('getCurrentDimensions set missing height');
		result.height = 821;
	}
	return result;
}

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
	var scalableObject = this.imageModel.getScalable();
	var sizeWidget = this.sizeWidget;

	// override this function to add a limit to width
	scalableObject.isCurrentDimensionsValid = function() {

		var dimensions = this.getCurrentDimensions();
		var width_limit_valid = (dimensions.width <= 1094);
		var isCurrentDimensionsValid_parent = ve.dm.Scalable.prototype.isCurrentDimensionsValid.call(this);

		if (!width_limit_valid) {
			// we're gonna show a more explicit message to the user
			var original_label = sizeWidget.errorLabel.getLabel();
			sizeWidget.errorLabel.setLabel( ve.msg( 'visualeditor-mediasizewidget-label-width-limit-error', 1094) );
		} else if (!isCurrentDimensionsValid_parent) {
			// this is the default message which we're going to change
			sizeWidget.errorLabel.setLabel( ve.msg( 'visualeditor-mediasizewidget-label-defaulterror' ) );
		}

		return width_limit_valid && isCurrentDimensionsValid_parent;
	};

	if ( ! scalableObject.getCurrentDimensions()) {
		console.log('Warning : dimensions empty');
		scalableObject.setCurrentDimensions(this.getCurrentDimensions());
		console.log(scalableObject.getCurrentDimensions());
	}
	this.sizeWidget.setScalable( scalableObject );
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
 * function to extract file name of a path
 */
ve.ui.PMGMediaDialog.prototype.basename = function (path) {
   return path.split('/').reverse()[0];
}

/**
 * return data to be inserted in VE editor
 * TODO : this function should be moved in dataModel Object
 */
ve.ui.PMGMediaDialog.prototype.getData = function () {


	//console.log('PMGMediaDialog.prototype.getData ');
	//var resource = 'File:Desklamp_lasercut.jpg';

	var resource = '';
	if (this.imageModel) {
		resource = this.basename(this.imageModel.getImageResourceName());
	}


	var targetWt = '#annotatedImageLight:' + resource;
	var jsondata = this.dataJsonModel? this.dataJsonModel : '';
	var hash = this.hash ? this.hash : '';

	// TODO : this set alwauys dimension to default, remove to allow sizing
	//this.imageModel.scalable.toggleDefault(true);

	var imageAttr = this.imageModel.getUpdatedAttributes();

	var tempateAttr = {
			hash: {
				wt: hash
			},
			jsondata: {
				wt: jsondata
			}
	};

	for(var name in imageAttr) {
		tempateAttr[name] = {
				wt : imageAttr[name]
		};
	}

	if (this.caption) {
		tempateAttr.caption = {wt: this.caption};
	} else {
		tempateAttr.caption = {wt: ''};
	}

	var data = [ {
		type: 'annotatedImageTransclusion',
		attributes: {
			mw: {
				parts: [ {
					template: {
						target: {
							'function': 'annotatedImageLight',
							wt: targetWt
						},
						params: tempateAttr
					}
				} ]
			}
		}
	}, {
		//type: '/mwTransclusionBlock'
		type: '/annotatedImageTransclusion'
		//type: '/simpleTransclusion',
	} ];
	//console.log('PMGMediaDialog.prototype.getData result');
	//console.log(data);

	return data;
}

/**
 * this function update the dom according to date in the image node
 * it should only update the changes attribute to avoid image reload
 * but to simplified, we replace all, and call insertImageNode
 *
 */
ve.ui.PMGMediaDialog.prototype.updateAnnotatedImageNode = function ( ) {
	var surfaceModel = this.getFragment().getSurface();

	// theoritically, it should be just :
	//this.imageModel.updateImageNode( this.selectedNode, surfaceModel );

	this.insertAnnotatedImageNode();
}

/**
 * this function update/insert the dom according to date in the image node, and jsondata
 * theoritically, this should be in ve.dm.AnnotatedImageNode model, but a we use a MWImageModel,
 * the function is incorrect for annotated images
 *
 */
ve.ui.PMGMediaDialog.prototype.insertAnnotatedImageNode = function ( ) {

	// theoritically, it should be just :
	//this.fragment = this.imageModel.insertImageNode( this.getFragment() );

	// TODO : do equivalent of imageModel.insertImageNode (but whit a translusion model)

	var fragment = this.getFragment();


	var captionDoc, offset, contentToInsert, selectedNode,
	nodeType = this.imageModel.getImageNodeType(),
	surfaceModel = fragment.getSurface();

	if ( !( fragment.getSelection() instanceof ve.dm.LinearSelection ) ) {
		return fragment;
	}

	selectedNode = fragment.getSelectedNode();

	// If there was a previous node, remove it first
	if ( selectedNode ) {
		// Remove the old image
		fragment.removeContent();
	}

	contentToInsert = this.getData();

	switch ( nodeType ) {
		case 'mwInlineImage':
			if ( selectedNode && selectedNode.type === 'mwBlockImage' ) {
				// If converting from a block image, create a wrapper paragraph for the inline image to go in.
				fragment.insertContent( [ { type: 'paragraph', internal: { generated: 'wrapper' } }, { type: '/paragraph' } ] );
				offset = fragment.getSelection().getRange().start + 1;
			} else {
				// Try to put the image inside the nearest content node
				offset = fragment.getDocument().data.getNearestContentOffset( fragment.getSelection().getRange().start );
			}
			if ( offset > -1 ) {
				fragment = fragment.clone( new ve.dm.LinearSelection( fragment.getDocument(), new ve.Range( offset ) ) );
			}
			fragment.insertContent( contentToInsert );
			return fragment;

		case 'mwBlockImage':
			// Try to put the image in front of the structural node
			offset = fragment.getDocument().data.getNearestStructuralOffset( fragment.getSelection().getRange().start, -1 );
			if ( offset > -1 ) {
				fragment = fragment.clone( new ve.dm.LinearSelection( fragment.getDocument(), new ve.Range( offset ) ) );
			}
			fragment.insertContent( contentToInsert );
			// Check if there is caption document and insert it

			captionDoc = this.imageModel.getCaptionDocument();
			/*
			 * this doesn't works : it add caption after image object
			 * if ( captionDoc.data.hasContent() ) {
				// Add contents of new caption
				surfaceModel.change(
					ve.dm.TransactionBuilder.static.newFromDocumentInsertion(
						surfaceModel.getDocument(),
						fragment.getSelection().getRange().start + 2,
						this.imageModel.getCaptionDocument()
					)
				);
			}*/
			return fragment;

		default:
			throw new Error( 'Unknown image node type ' + nodeType );
	}
}

/**
 * @inheritdoc
 */
ve.ui.PMGMediaDialog.prototype.getActionProcess = function ( action ) {
	var handler;

	var mediaDialog = this;

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

				//TODO : check if we must add a node for Annotation

				if (
					// There was an initial node
					this.selectedNode &&
					// And we didn't change the image type block/inline or vice versa
					this.selectedNode.type === this.imageModel.getImageNodeType() &&
					// And we didn't change the image itself
					this.selectedNode.getAttribute( 'src' ) ===
						this.imageModel.getImageSource()
					// && ! this.imageModel.hasAnnotationChanges()
				) {
					// We only need to update the attributes of the current node
					//this.imageModel.updateImageNode( this.selectedNode, surfaceModel );
					this.updateAnnotatedImageNode();
				} else {
					// Replacing an image or inserting a brand new one
					// TODO : if this is an annotation, we must compute the correct html
					//this.fragment = this.imageModel.insertImageNode( this.getFragment() );
					this.insertAnnotatedImageNode();
				}

				this.close( { action: action } );
			};
			break;
		case 'annotate':
			handler = function () {
				this.switchPanels( 'annotate', true );
			};
			break;
		case 'annotate-back':
			handler = function () {
				mediaDialog.imageAnnotationEditor.hide();
				this.switchPanels( 'edit' );
				//this.switchPanels( 'annotate', true );
			};
			break;
		case 'annotate-save':
			handler = function () {
				mediaDialog.imageAnnotationEditor.save();
				//this.switchPanels( 'annotate', true );
			};
			break;
		default:
			return ve.ui.PMGMediaDialog.super.prototype.getActionProcess.call( this, action );
	}

	return new OO.ui.Process( handler, this );
};

/* Registration */

ve.ui.windowFactory.register( ve.ui.PMGMediaDialog );

// hack  : replace function MWMediaDialog.prototype.getReadyProcess
// to manage upload after file drop
/**
 * @inheritdoc
 */
ve.ui.MWMediaDialog.prototype.getReadyProcess = function ( data ) {

	//console.log('MWMediaDialog.prototype.getReadyProcess hacked');
	return ve.ui.MWMediaDialog.super.prototype.getReadyProcess.call( this, data )
		.next( function () {

			var panel = this.selectedNode ? 'edit' : 'search';
			// #switchPanels triggers field focus, so do this in the ready process
			this.switchPanels( panel );
			if (panel == 'search' && data.file) {
				this.searchTabs.setTabPanel( 'upload' );
			}
			// Revalidate size
			this.sizeWidget.validateDimensions();
		}, this );
};
