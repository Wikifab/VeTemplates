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
		divFloatWrapper = null, // optional wrapper di to add float class
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

	var imgLastWrapper = imgWrapper;

	// if img not found, it may be in a sub div element :
	if (! img) {
		divFloatWrapper = imgWrapper && findChildren( imgWrapper, [ 'div' ] )[ 0 ] || null;
		if (divFloatWrapper) {
			imgLastWrapper = divFloatWrapper;
			img = divFloatWrapper && findChildren( divFloatWrapper, [ 'img', 'video' ] )[ 0 ] || null;
		}
		if (! img) {
			var divThumb = divFloatWrapper && findChildren( divFloatWrapper, [ 'div'] )[ 0 ] || null;
			var divThumbiner = divThumb && findChildren( divThumb, [ 'div'] )[ 0 ] || null;
			imgLastWrapper = divThumbiner;
			img = divThumbiner && findChildren( divThumbiner, [ 'img', 'video' ] )[ 0 ] || null;

		}
		if (! img) {
			var divThumb = divFloatWrapper && findChildren( divFloatWrapper, [ 'div'] )[ 0 ] || null;

			img = $(figure).find('img')[0];
		}
	}

	var captionElement = $(figure).find('.thumbcaption')[0];


	caption = captionElement && captionElement.innerText || '';
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

	//console.log("toDataElement attr src");
	//console.log(attributes.src);
	//console.log(domElements);

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

	if ( caption ) {
		attributes.caption =  caption;
	}

	// above was attribut common to MwImage,
	// next we add attributs abouts annotations

	var thumbSrc = '';
	if (img) {
		thumbSrc = img.getAttribute('src');
	}

	attributes.mw = mwData;
	attributes.originalMw = mwDataJSON;
	attributes.jsondata = img && img.getAttribute( 'data-jsondata' );
	attributes.hash = img && img.getAttribute( 'data-hash' );
	//console.log('toDataElement 3');
	//console.log(domElements);
	//console.log(attributes.jsondata);
	//console.log(mwData);

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

	//console.log('Annotated toDataElement result');
	//console.log(dataElement);

	return dataElement;
};

ve.dm.AnnotatedImageTransclusionNode.static.toDomElements = function ( data, doc, converter ) {
	//console.log("AnnotatedImageTransclusionNode.static.toDomElements ");
	//console.log(data);

	var dataElement = data[ 0 ];

	if (! dataElement) {
		dataElement = data;
	}
	var template = dataElement.attributes.mw.parts[0].template;
	var params = template.params;


	var width, height,
		mediaClass = params.mediaClass.wt,
		figure = doc.createElement( 'figure' ),
		imgWrapper = doc.createElement( dataElement.attributes.href && dataElement.attributes.href !== '' ? 'a' : 'span' ),
		img = doc.createElement( mediaClass === 'Image' ? 'img' : 'video' ),
		wrapper = doc.createElement( 'div' ),
		captionwrapper = doc.createElement( 'div' ),
		//classAttr = this.getClassAttrFromAttributes( dataElement.attributes ),
		captionData = [];
		paramIndex = 0;

	if ($.isArray(data)) {
		captionData = data.slice( 1, -1 );
	}

	width = params.width ? params.width.wt : null;
	height = params.height ? params.height.wt : null;
	// If defaultSize is set, and was set on the way in, use the original width and height
	// we got on the way in.
	if ( params.defaultSize ) {
		if ( params.originalWidth && params.originalWidth.wt !== undefined ) {
			width = params.originalWidth.wt;
		}
		if ( params.originalHeight && params.originalHeight.wt !== undefined ) {
			height = params.originalWidth.wt;
		}
	}

	var resource = params.resource.wt.replace('./','');

	var dataParsoid = ''; //'{"stx":"html","dsr":[455,563,null,null],"pi":[[{"k":"hash","named":true},{"k":"jsondata","named":true},{"k":"1"},{"k":"2"},{"k":"3"}]]}';


	var dataToStringify = dataElement.attributes.mw;

	if (dataToStringify.parts[0].template.params.height) {
		delete dataToStringify.parts[0].template.params.height;
	}
	if (dataToStringify.parts[0].template.params.width) {
		delete dataToStringify.parts[0].template.params.width;
	}
	if (dataToStringify.parts[0].template.params.defaultSize) {
		delete dataToStringify.parts[0].template.params.defaultSize;
	}
	if (dataToStringify.parts[0].template.params.borderImage) {
		delete dataToStringify.parts[0].template.params.borderImage;
	}
	//if (dataToStringify.parts[0].template.params.jsondata) {
		//delete dataToStringify.parts[0].template.params.jsondata;
	//}
	if ( dataToStringify.parts[0].template.params.href == '') {
		delete dataToStringify.parts[0].template.params.href;
	}
	if ( dataToStringify.parts[0].template.params.isLinked ) {
		delete dataToStringify.parts[0].template.params.isLinked;
	}
	if(width) {
		dataToStringify.parts[0].template.params[paramIndex] = {wt: width + 'px'};
		paramIndex = paramIndex  +1;
	}


	var dataMw = JSON.stringify(dataToStringify);

	//console.log('stringit fy data-mw');
	//console.log(dataToStringify);

	dataMw = '{"parts":[{"template":{"target":{"wt":"#annotatedImageLight:Fichier:Tuto test images Lamp-lasercut 1r.JPG","function":"annotatedImageLight"},"params":{"1":{"wt":"thumbnail"},"2":{"wt":"100px"},"3":{"wt":"right"},"hash":{"wt":""},"jsondata":{"wt":""}},"i":0}}]}';


	// working
	//{"parts":[{"template":{"target":{"wt":"#annotatedImageLight:Fichier:Test de tuto LB Final.jpg","function":"annotatedImageLight"},"params":{"0":{"wt":"800px"},"hash":{"wt":"cd32c305cd86e4251e40e177c8d59e18"},"mediaClass":{"wt":"Image"},"type":{"wt":"thumb"},"align":{"wt":"default"},"src":{"wt":"/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/ia-cd32c305cd86e4251e40e177c8d59e18-px-Test_de_tuto_LB_Final.jpg.png"},"href":{"wt":"./Fichier:Test de tuto LB Final.jpg"},"resource":{"wt":"./Fichier:Test de tuto LB Final.jpg"}},"i":0}}]}
	// not working
	//{"parts":[{"template":{"target":{"function":"annotatedImageLight","wt":"#annotatedImageLight:Fichier:Test de tuto LB Final.jpg"},"params":{"0":{"wt":"800px"},"hash":{"wt":"7f37ed0e83b300ed16023a625366f787"},"mediaClass":{"wt":"Image"},"type":{"wt":"frameless"},"align":{"wt":"default"},"src":{"wt":"/w/images/thumb/7/7a/Test_de_tuto_LB_Final.jpg/ia-7f37ed0e83b300ed16023a625366f787-px-Test_de_tuto_LB_Final.jpg.png"},"href":{"wt":""},"resource":{"wt":"Fichier:Test de tuto LB Final.jpg"},"isLinked":{"wt":true}}}}]}


	dataMw = '{"parts":[{"template":{"target":{"function":"annotatedImageLight","wt":"#annotatedImageLight:Fichier:Test de tuto LB Final.jpg"},"params":{"hash":{"wt":""},"jsondata":{"wt":""},"mediaClass":{"wt":"Image"},"type":{"wt":"thumb"},"width":{"wt":800},"height":{"wt":600},"defaultSize":{"wt":true},"borderImage":{"wt":false},"align":{"wt":"default"},"src":{"wt":"http://demo-dokit.localtest.me/w/images/7/7a/Test_de_tuto_LB_Final.jpg"},"href":{"wt":"./Fichier:Test de tuto LB Final.jpg"},"resource":{"wt":"./Fichier:Test de tuto LB Final.jpg"}}}}]}';
	dataMw = '{"parts":[{"template":{"target":{"wt":"#annotatedImageLight:Fichier:Test de tuto LB Final.jpg","function":"annotatedImageLight"},"params":{"hash":{"wt":""},"jsondata":{"wt":""},"mediaClass":{"wt":"Image"},"type":{"wt":"thumb"},"width":{"wt":800},"height":{"wt":600}}}}]}';
	dataMw = '{"parts":[{"template":{"target":{"function":"annotatedImageLight","wt":"#annotatedImageLight:Fichier:Test de tuto LB Final.jpg"},"params":{"0":{"wt":"800px"},"hash":{"wt":""},"jsondata":{"wt":""},"mediaClass":{"wt":"Image"},"type":{"wt":"thumb"},"align":{"wt":"default"},"src":{"wt":"http://demo-dokit.localtest.me/w/images/7/7a/Test_de_tuto_LB_Final.jpg"},"href":{"wt":"./Fichier:Test de tuto LB Final.jpg"},"resource":{"wt":"./Fichier:Test de tuto LB Final.jpg"}}}}]}';
	dataMw = '{"parts":[{"template":{"target":{"function":"annotatedImageLight","wt":"#annotatedImageLight:Fichier:Test de tuto LB Final.jpg"},"params":{"0":{"wt":"800px"},"hash":{"wt":""},"jsondata":{"wt":""},"mediaClass":{"wt":"Image"},"type":{"wt":"thumb"},"align":{"wt":"default"},"src":{"wt":"http://demo-dokit.localtest.me/w/images/7/7a/Test_de_tuto_LB_Final.jpg"},"href":{"wt":"./Fichier:Test de tuto LB Final.jpg"},"resource":{"wt":"./Fichier:Test de tuto LB Final.jpg"}}}}]}';
	dataMw = JSON.stringify(dataToStringify);
	console.log(dataMw);
	//var dataMw = '{"parts":[{"template":{"target":{"wt":"#annotatedImageLight:Fichier:Tuto test images Lamp-lasercut 1r.JPG","function":"annotatedImageLight"},"params":{"1":{"wt":"thumbnail"},"2":{"wt":"100px"},"3":{"wt":"right"},"hash":{"wt":""},"jsondata":{"wt":""}},"i":0}}]}';

	wrapper.setAttribute( 'class', 'annotatedImageDiv');
	wrapper.setAttribute( 'data-x-typeof', mediaClass);
	wrapper.setAttribute( 'data-resource', resource);
	wrapper.setAttribute( 'data-sourceimage', params.src.wt);
	wrapper.setAttribute( 'about', '#mwt' + Math.floor( 1000000000 * Math.random() ));
	wrapper.setAttribute( 'typeof', 'mw:Transclusion');
	wrapper.setAttribute( 'data-parsoid', dataParsoid);
	wrapper.setAttribute( 'data-mw', dataMw);


	var floatWrapper = doc.createElement( 'div' );
	floatWrapper.setAttribute( 'class', 'floatright');



	// RDFa type
	//figure.setAttribute( 'typeof', this.getRdfa( mediaClass, dataElement.attributes.type ) );

	//if ( classAttr ) {
	//	figure.className = classAttr;
	//}

	if ( dataElement.attributes.href !== '' ) {
		imgWrapper.setAttribute( 'href', dataElement.attributes.href );
	}



	img.setAttribute( mediaClass === 'Image' ? 'src' : 'poster', params.src.wt );
	img.setAttribute( 'width', width );
	img.setAttribute( 'height', height );
	if (dataToStringify.parts[0].template.params.jsondata) {
		img.setAttribute( 'data-jsondata', dataToStringify.parts[0].template.params.jsondata);
		img.setAttribute( 'data-hash', dataToStringify.parts[0].template.params.hash);
	}
	//img.setAttribute( 'resource', dataElement.attributes.resource );
	if ( params.alt !== undefined ) {
		img.setAttribute( 'alt', params.alt.wt );
	}


	wrapper.appendChild( imgWrapper );

	if( floatWrapper) {
		imgWrapper.appendChild(floatWrapper);
		floatWrapper.appendChild( img );
	} else {
		imgWrapper.appendChild( img );
	}

	// If length of captionData is smaller or equal to 2 it means that there is no caption or that
	// it is empty - in both cases we are going to skip appending <figcaption>.
	if ( captionData.length > 2 ) {
		if ($.isArray(data)) {
			converter.getDomSubtreeFromData( data.slice( 1, -1 ), captionwrapper );
			while ( captionwrapper.firstChild ) {
				figure.appendChild( captionwrapper.firstChild );
			}
		}
	}
	return [ wrapper ];
};


/**
 * we must convert attribut from image for transclusion :
 *
 * "width=Y" must be converted ty "Ypx"
 * "catpion=XXX" set in last params , without prefix 'caption='
 */
ve.dm.AnnotatedImageTransclusionNode.prototype.getWikitext = function () {
	//console.log("AnnotatedImageTransclusionNode.prototype.getWikitext");
	var attrs = this.getAttribute( 'mw' );

	if (attrs.parts[0].template.params.width.wt) {
		attrs.parts[0].template.params.size = {
				wt: attrs.parts[0].template.params.width.wt + 'px'
		};
	}
	//console.log(attrs);

	var wikitext = this.constructor.static.getWikitext( attrs );

	var wikitext = wikitext.replace('|size=','|');


	var caption = '';

	var regex = /\|caption=([^|}]+)/g;
	var found = regex.exec(wikitext);
	if(found && found[1] != undefined) {
		caption = found[1];
	}
	wikitext = wikitext.replace ('}}','|' + caption + '}}');

	//console.log(wikitext);
	return wikitext;
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

	//console.log('AnnotatedImageTransclusionNode.prototype.onParseSuccess');
	//console.log(response);
	//console.log(deferred);

	if ( ve.getProp( response, 'visualeditor', 'result' ) !== 'success' ) {
		return this.onParseError( deferred );
	}

	// hack : img element are escaped :
	var html = response.visualeditor.content
	//console.log(html);
	var regex1 = new RegExp('\\&lt;img ([^<>]+) /\\&gt;');
	var regex2 = new RegExp('\\&lt;img ([^<>]+) /(\\&gt;|>)');

	// HACK : set back all img tags escaped by parsoid :
	html = html.replace(regex2,"<img $1 />");

	// HACK : same for <a> tags escaped by parsoid :
	var regexLink = new RegExp('\\&lt;a ([^<>]+)(\\&gt;|>)(.+)\\&lt;/a( +)(\\&gt;|>)');
	html = html.replace(regexLink,"<a $1>$2</a>");
	//console.log('onParseSuccess after link');
	//console.log(html);

	// Work around https://github.com/jquery/jquery/issues/1997
	contentNodes = $.parseHTML( html, this.model && this.getModelHtmlDocument() ) || [];
	deferred.resolve( this.constructor.static.filterRendering( contentNodes ) );
};


ve.dm.modelRegistry.register( ve.dm.AnnotatedImageTransclusionNode );
