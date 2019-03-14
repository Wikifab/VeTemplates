/*!
 * VisualEditor DataModel AnnotatedImageTransclusionNode class.
 *
 */

/**
 * DataModel MediaWiki simpletransclusion node.
 *
 * this represente the node in VE,
 * it contains informations required to match an html node to the simpleTranslusion Type
 *
 * @class
 * @abstract
 * @extends ve.dm.MWTransclusionBlockNode
 *
 * @constructor
 * @param {Object} [element] Reference to element in linear model
 */
ve.dm.AnnotatedImageTransclusionNode = function VeDmAnnotatedImageTransclusionNode() {
	// Parent constructor
	ve.dm.AnnotatedImageTransclusionNode.super.apply( this, arguments );

};

OO.inheritClass( ve.dm.AnnotatedImageTransclusionNode, ve.dm.MWTransclusionBlockNode );

/* Static members */

ve.dm.AnnotatedImageTransclusionNode.static.name = 'annotatedImageTransclusion';
//ve.dm.AnnotatedImageTransclusionNode.static.name = 'mwTransclusion';

ve.dm.AnnotatedImageTransclusionNode.static.matchTagNames = ['div', 'p'];

ve.dm.AnnotatedImageTransclusionNode.static.matchRdfaTypes = [ 'mw:Transclusion', 'mw:SimpleTemplate' ];


ve.dm.AnnotatedImageTransclusionNode.static.matchTemplatesNames = ['#annotatedImage'];

/**
 * match function to match only element of template defined in matchTemplatesNames
 */
ve.dm.AnnotatedImageTransclusionNode.static.matchFunction = function ( node ) {

	var attr = $(node).attr('data-mw');
	if ( !attr) {
		return false;
	}
	attr =  JSON.parse(attr);
	var template = attr.parts && attr.parts[0] && attr.parts[0].template;
	if ( ! template) {
		return false;
	}
	var name = template.target && template.target.wt;
	if ( ! name) {
		return false;
	}

	for (var index in this.matchTemplatesNames) {
		if (name.startsWith(this.matchTemplatesNames[index])) {
			console.log('match template annotated image b');
			console.log(attr);
			console.log(node);
			return true
		}
	}
	return false;
}


/**
 * Node type to use when the transclusion is a block
 *
 * @static
 * @property {string}
 * @inheritable
 */
ve.dm.AnnotatedImageTransclusionNode.static.blockType = 'annotatedImageTransclusion';


ve.dm.AnnotatedImageTransclusionNode.static.toDataElement = function ( domElements, converter ) {
	var dataElement,
		mwDataJSON = domElements[ 0 ].getAttribute( 'data-mw' ),
		mwData = mwDataJSON ? JSON.parse( mwDataJSON ) : {},
		isInline = this.isHybridInline( domElements, converter ),
		type = isInline ? this.inlineType : this.blockType;

	var newDimensions, attributes,
		figure, imgWrapper, img, caption,
		classAttr, typeofAttrs, errorIndex, width, height, altText, types;

	// Workaround for jQuery's .children() being expensive due to
	// https://github.com/jquery/sizzle/issues/311
	function findChildren( parent, nodeNames ) {
		return Array.prototype.filter.call( parent.childNodes, function ( element ) {
			return nodeNames.indexOf( element.nodeName.toLowerCase() ) !== -1;
		} );
	}

	figure = domElements[ 0 ];
	imgWrapper = findChildren( figure, [ 'a', 'span' ] )[ 0 ] || null;
	img = imgWrapper && findChildren( imgWrapper, [ 'img', 'video' ] )[ 0 ] || null;

	console.log(img);

	caption = findChildren( figure, [ 'figcaption' ] )[ 0 ] || null;
	classAttr = figure.getAttribute( 'class' );
	typeofAttrs = figure.getAttribute( 'typeof' ).split( ' ' );
	errorIndex = typeofAttrs.indexOf( 'mw:Error' );
	width = img && img.getAttribute( 'width' );
	height = img && img.getAttribute( 'height' );
	altText = img && img.getAttribute( 'alt' );

	if ( errorIndex !== -1 ) {
		typeofAttrs.splice( errorIndex, 1 );
	}

	//types = this.rdfaToTypes[ typeofAttrs[ 0 ] ];
	types = { mediaClass: 'mw:annotedImageTransclusion', frameType: 'frameless'  };

	attributes = {
		mediaClass: types.mediaClass,
		type: types.frameType,
		href: ( imgWrapper && imgWrapper.getAttribute( 'href' ) ) || '',
		src: ( img && ( img.getAttribute( 'src' ) || img.getAttribute( 'poster' ) ) ) || '',
		resource: figure && figure.getAttribute( 'data-resource' )
	};

	if ( altText !== null ) {
		attributes.alt = altText;
	}
	if ( errorIndex !== -1 ) {
		attributes.isError = true;
	}

	//this.setClassAttributes( attributes, classAttr );

	attributes.align = attributes.align || 'default';

	attributes.width = width !== null && width !== '' ? Number( width ) : null;
	attributes.height = height !== null && height !== '' ? Number( height ) : null;

	// Default-size
	if ( attributes.defaultSize ) {
		// Force wiki-default size for thumb and frameless
		if (
			attributes.type === 'thumb' ||
			attributes.type === 'frameless'
		) {
			// We're going to change .width and .height, store the original
			// values so we can restore them later.
			// FIXME "just" don't modify .width and .height instead
			attributes.originalWidth = attributes.width;
			attributes.originalHeight = attributes.height;
			// Parsoid hands us images with default Wikipedia dimensions
			// rather than default MediaWiki configuration dimensions.
			// We must force local wiki default in edit mode for default
			// size images.
			newDimensions = ve.dm.MWImageNode.static.scaleToThumbnailSize( attributes );
			if ( newDimensions ) {
				attributes.width = newDimensions.width;
				attributes.height = newDimensions.height;
			}
		}
	}

	dataElement = { type: this.name, attributes: attributes };


	// above was attribut common to MwImage,
	// next we add attributs abouts annotations

	var thumbSrc = '';
	if (img) {
		thumbSrc = img.getAttribute('src');
	}

	attributes.mw = mwData;
	attributes.originalMw = mwDataJSON;
	attributes.jsondata = img && img.getAttribute( 'data-jsondata' );
	attributes.sourceimage = figure && figure.getAttribute( 'data-sourceimage' );
	attributes.thumbSrc = thumbSrc;

	if ( ! attributes.sourceimage) {
		console.log('MISSING SOURCE IMAGE');
		console.log(figure);
	}

	dataElement = {
		type: type,
		attributes: attributes
	};


	if ( domElements.length === 1 && [ 'td', 'th' ].indexOf( domElements[ 0 ].nodeName.toLowerCase() ) !== -1 ) {
		dataElement.type = this.cellType;
		ve.dm.TableCellableNode.static.setAttributes( dataElement.attributes, domElements );
	}

	if ( !domElements[ 0 ].getAttribute( 'data-ve-no-generated-contents' ) ) {
		this.storeGeneratedContents( dataElement, domElements, converter.getStore() );
	}

	console.log('Annotated toDataElement result');
	console.log(dataElement);

	return dataElement;
};

/**
 * overide parent method
 * I don't know why, but if we don't overide, an additional arg is passed in first position of the method (dataModel)
 *
 *
 * @param {jQuery.Deferred} deferred The Deferred object created by #generateContents
 * @param {Object} response Response data
 */
ve.ce.AnnotatedImageTransclusionNode.prototype.onParseSuccess = function ( deferred, response) {
	var contentNodes;

	console.log('AnnotatedImageTransclusionNode.prototype.onParseSuccess');
	console.log(response);
	console.log(deferred);

	if ( ve.getProp( response, 'visualeditor', 'result' ) !== 'success' ) {
		return this.onParseError( deferred );
	}

	// hack : img element are escaped :
	var html = response.visualeditor.content
	console.log(html);
	var regex1 = new RegExp('\\&lt;img ([^<>]+) /\\&gt;');
	var regex2 = new RegExp('\\&lt;img ([^<>]+) /(\\&gt;|>)');

	// HACK : set back all img tags escaped by parsoid :
	html = html.replace(regex2,"<img $1 />");

	// HACK : same for <a> tags escaped by parsoid :
	var regexLink = new RegExp('\\&lt;a ([^<>]+)(\\&gt;|>)(.+)\\&lt;/a( +)(\\&gt;|>)');
	html = html.replace(regexLink,"<a $1>$2</a>");
	console.log('onParseSuccess after link');
	console.log(html);

	// Work around https://github.com/jquery/jquery/issues/1997
	contentNodes = $.parseHTML( html, this.model && this.getModelHtmlDocument() ) || [];
	deferred.resolve( this.constructor.static.filterRendering( contentNodes ) );
};


ve.dm.modelRegistry.register( ve.dm.AnnotatedImageTransclusionNode );
