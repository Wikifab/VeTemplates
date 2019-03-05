/*!
 * VisualEditor ContentEditable PMGBlockImageNode class.
 *
 * @copyright 2011-2018 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * ContentEditable MediaWiki image node.
 *
 * @class
 * @abstract
 * @extends ve.ce.GeneratedContentNode
 * @mixins ve.ce.FocusableNode
 * @mixins ve.ce.MWResizableNode
 *
 * @constructor
 * @param {jQuery} $focusable Focusable part of the node
 * @param {jQuery} $image Image part of the node
 * @param {Object} [config] Configuration options
 */
ve.ce.PMGBlockImageNode = function VeCePMGBlockImageNode( $focusable, $image, config ) {

	// Parent constructor
	ve.ce.PMGBlockImageNode.super.call(  $focusable, $image, config );

	// Properties
	this.jsonData = jsonData;
};

/* Inheritance */

OO.inheritClass( ve.ce.PMGBlockImageNode, ve.ce.MWBlockImageNode );

/* Static Properties */

ve.ce.PMGBlockImageNode.static.primaryCommandName = 'mediapmg';


/* Methods */


/**
 * @inheritdoc ve.ce.GeneratedContentNode
 */
ve.ce.PMGBlockImageNode.prototype.generateContents = function () {

	console.log('ce.PMGBlockImage.generateContent');
	var xhr,
		width = this.getModel().getAttribute( 'width' ),
		height = this.getModel().getAttribute( 'height' ),
		deferred = $.Deferred();

	// If the current rendering is larger don't fetch a new image, just let the browser resize
	if ( this.renderedDimensions && this.renderedDimensions.width > width ) {
		return deferred.reject().promise();
	}

	xhr = new mw.Api().get( {
		action: 'query',
		prop: 'imageinfo',
		iiprop: 'url',
		iiurlwidth: width,
		iiurlheight: height,
		titles: this.getModel().getFilename()
	} )
		.done( this.onParseSuccess.bind( this, deferred ) )
		.fail( this.onParseError.bind( this, deferred ) );

	return deferred.promise( { abort: xhr.abort } );
};

/**
 * Handle a successful response from the parser for the image src.
 *
 * @param {jQuery.Deferred} deferred The Deferred object created by generateContents
 * @param {Object} response Response data
 */
ve.ce.PMGBlockImageNode.prototype.onParseSuccess = function ( deferred, response ) {

	console.log('ce.PMGBlockImage.onParseSuccess');
	var id, src, pages = ve.getProp( response, 'query', 'pages' );
	for ( id in pages ) {
		if ( pages[ id ].imageinfo ) {
			src = pages[ id ].imageinfo[ 0 ].thumburl;
		}
	}
	if ( src ) {
		deferred.resolve( src );
	} else {
		deferred.reject();
	}
};

/**
 * @inheritdoc ve.ce.GeneratedContentNode
 */
ve.ce.PMGBlockImageNode.prototype.render = function ( generatedContents ) {

	console.log('ce.PMGBlockImage.render');
	this.$image.attr( 'src', generatedContents );
	this.$image.attr( 'jsonData', this.jsonData );
	// As we only re-render when the image is larger than last rendered size
	// this will always be the largest ever rendering
	this.renderedDimensions = ve.copy( this.model.getScalable().getCurrentDimensions() );
	if ( this.live ) {
		this.afterRender();
	}
};

/**
 * Handle an unsuccessful response from the parser for the image src.
 *
 * @param {jQuery.Deferred} deferred The promise object created by generateContents
 * @param {Object} response Response data
 */
ve.ce.PMGBlockImageNode.prototype.onParseError = function ( deferred ) {
	deferred.reject();
};
