/*!
 * VisualEditor DataModel PMGAnnotatedImageModel class.
 *
 */

/**
 * MediaWiki annotated image model.
 *
 * @class
 * @mixins OO.EventEmitter
 *
 * @constructor
 * @param {ve.dm.Document} parentDoc Document that contains or will contain the image
 * @param {Object} [config] Configuration options
 * @cfg {string} [resourceName] The resource name of the given media file
 * @cfg {Object} [currentDimensions] Current dimensions, width & height
 * @cfg {Object} [minDimensions] Minimum dimensions, width & height
 * @cfg {boolean} [isDefaultSize] Object is using its default size dimensions
 */
ve.dm.PMGAnnotatedImageModel = function VeDmPMGAnnotatedImageModel( parentDoc, config ) {


	ve.dm.PMGAnnotatedImageModel.super.call( this, parentDoc, config );

	// properties concerning annotated Images
	this.thumbUrl = null;
	this.jsonData = '';

};

/* Inheritance */

//OO.mixinClass( ve.dm.MWImageModel, OO.EventEmitter );
OO.inheritClass( ve.dm.PMGAnnotatedImageModel, ve.dm.MWImageModel );

/* Events */

/**
 * Change of image alignment or of having alignment at all
 *
 * @event alignmentChange
 * @param {string} Alignment 'left', 'right', 'center' or 'none'
 */

/**
 * Change in size type between default and custom
 *
 * @event sizeDefaultChange
 * @param {boolean} Image is default size
 */

/**
 * Change in the image type
 *
 * @event typeChange
 * @param {string} Image type 'thumb', 'frame', 'frameless' or 'none'
 */

/* Static Methods */

/**
 * Create a new image node based on given parameters.
 *
 * @param {Object} attributes Image attributes
 * @param {string} [imageType] Image node type 'mwInlineImage' or 'mwBlockImage'.
 *  Defaults to 'mwBlockImage'
 * @return {ve.dm.MWImageNode} An image node
 */
ve.dm.PMGAnnotatedImageModel.static.createImageNode = function ( attributes, imageType ) {
	var attrs, newNode, newDimensions,
		defaultThumbSize = mw.config.get( 'wgVisualEditorConfig' ).defaultUserOptions.defaultthumbsize;

	attrs = ve.extendObject( {
		mediaClass: 'Image',
		type: 'thumb',
		align: 'default',
		width: defaultThumbSize,
		mediaType: 'BITMAP',
		defaultSize: true
	}, attributes );

	if ( attrs.defaultSize ) {
		newDimensions = ve.dm.MWImageNode.static.scaleToThumbnailSize( attrs, attrs.mediaType );
		if ( newDimensions ) {
			attrs.width = newDimensions.width;
			attrs.height = newDimensions.height;
		}
	}

	imageType = imageType || 'mwBlockImage';

	newNode = ve.dm.nodeFactory.createFromElement( {
		type: imageType,
		attributes: attrs
	} );

	ve.dm.MWImageNode.static.syncScalableToType( attrs.type, attrs.mediaType, newNode.getScalable() );

	return newNode;
};

/**
 * Load from image data with scalable information.
 *
 * @param {Object} attrs Image node attributes
 * @param {ve.dm.Document} parentDoc Document that contains or will contain the image
 * @return {ve.dm.PMGAnnotatedImageModel} Image model
 */
ve.dm.PMGAnnotatedImageModel.static.newFromImageAttributes = function ( attrs, parentDoc ) {
	var imgModel = new ve.dm.PMGAnnotatedImageModel(
		parentDoc,
		{
			resourceName: attrs.resource,
			currentDimensions: {
				width: attrs.width,
				height: attrs.height
			},
			defaultSize: !!attrs.defaultSize
		}
	);

	// Cache the attributes so we can create a new image without
	// losing any existing information
	imgModel.cacheOriginalImageAttributes( attrs );

	imgModel.setImageSource( attrs.src );
	imgModel.setFilename( new mw.Title( ve.normalizeParsoidResourceName( attrs.resource ) ).getMainText() );
	imgModel.setImageHref( attrs.href );

	// Set bounding box
	imgModel.setBoundingBox( {
		width: attrs.width,
		height: attrs.height
	} );

	// Collect all the information
	imgModel.toggleBorder( !!attrs.borderImage );
	imgModel.setAltText( attrs.alt || '' );

	imgModel.setType( attrs.type );

	// Fix cases where alignment is undefined
	// Inline images have no 'align' (they have 'valign' instead)
	// But we do want an alignment case for these in case they
	// are transformed to block images
	imgModel.setAlignment( attrs.align || 'default' );

	// Default size
	imgModel.toggleDefaultSize( !!attrs.defaultSize );

	// TODO: When scale/upright is available, set the size
	// type accordingly
	imgModel.setSizeType( imgModel.isDefaultSize() ? 'default' : 'custom' );

	if (attrs.jsonData) {

	}

	return imgModel;
};

/**
 * Load from existing image node.
 *
 * @param {ve.dm.MWImageNode} node Image node
 * @return {ve.dm.PMGAnnotatedImageModel} Image model
 */
ve.dm.PMGAnnotatedImageModel.static.newFromImageNode = function ( node ) {
	return ve.dm.PMGAnnotatedImageModel.static.newFromImageAttributes( node.getAttributes(), node.getDocument() );
};

/* Methods */

/**
 * Get the hash object of the current image model state.
 *
 * @return {Object} Hash object
 */
ve.dm.PMGAnnotatedImageModel.prototype.getHashObject = function () {
	var hash = {
		filename: this.getFilename(),
		altText: this.getAltText(),
		type: this.getType(),
		alignment: this.getAlignment(),
		sizeType: this.getSizeType(),
		border: this.hasBorder(),
		borderable: this.isBorderable()
	};

	if ( this.getScalable() ) {
		hash.scalable = {
			currentDimensions: ve.copy( this.getScalable().getCurrentDimensions() ),
			isDefault: this.getScalable().isDefault()
		};
	}
	if ( this.getJsonData() ) {
		hash.jsonData = this.getJsonData();
	}
	return hash;
};


/**
 * Get the current image node type according to the attributes.
 * If either of the parameters are given, the node type is tested
 * against them, otherwise, it is tested against the current image
 * parameters.
 *
 * @param {string} [imageType] Optional. Image type.
 * @param {string} [align] Optional. Image alignment.
 * @return {string} Node type 'mwInlineImage' or 'mwBlockImage'
 */
ve.dm.PMGAnnotatedImageModel.prototype.getImageNodeType = function ( imageType, align ) {
	imageType = imageType || this.getType();

	if (
		( this.getType() === 'frameless' || this.getType() === 'none' ) &&
		( !this.isAligned( align ) || this.isDefaultAligned( imageType, align ) )
	) {
		return 'mwInlineImage';
	} else {
		return 'mwBlockImage';
	}
};


/**
 * Update an existing image node by changing its attributes
 *
 * @param {ve.dm.MWImageNode} node Image node to update
 * @param {ve.dm.Surface} surfaceModel Surface model of main document
 */
ve.dm.PMGAnnotatedImageModel.prototype.updateImageNode = function ( node, surfaceModel ) {
	var captionRange, captionNode,
		doc = surfaceModel.getDocument();

	// Update the caption
	if ( node.getType() === 'mwBlockImage' ) {
		captionNode = node.getCaptionNode();
		if ( !captionNode ) {
			// There was no caption before, so insert one now
			surfaceModel.getFragment()
				.adjustLinearSelection( 1 )
				.collapseToStart()
				.insertContent( [ { type: 'mwImageCaption' }, { type: '/mwImageCaption' } ] );
			// Update the caption node
			captionNode = node.getCaptionNode();
		}

		captionRange = captionNode.getRange();

		// Remove contents of old caption
		surfaceModel.change(
			ve.dm.TransactionBuilder.static.newFromRemoval(
				doc,
				captionRange,
				true
			)
		);

		// Add contents of new caption
		surfaceModel.change(
			ve.dm.TransactionBuilder.static.newFromDocumentInsertion(
				doc,
				captionRange.start,
				this.getCaptionDocument()
			)
		);
	}

	// Update attributes
	surfaceModel.change(
		ve.dm.TransactionBuilder.static.newFromAttributeChanges(
			doc,
			node.getOffset(),
			this.getUpdatedAttributes()
		)
	);
};

/**
 * Insert image into a surface.
 *
 * Image is inserted at the current fragment position.
 *
 * @param {ve.dm.SurfaceFragment} fragment Fragment covering range to insert at
 * @return {ve.dm.SurfaceFragment} Fragment covering inserted image
 * @throws {Error} Unknown image node type
 */
ve.dm.PMGAnnotatedImageModel.prototype.insertImageNode = function ( fragment ) {
	var captionDoc, offset, contentToInsert, selectedNode,
		nodeType = this.getImageNodeType(),
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
			captionDoc = this.getCaptionDocument();
			if ( captionDoc.data.hasContent() ) {
				// Add contents of new caption
				surfaceModel.change(
					ve.dm.TransactionBuilder.static.newFromDocumentInsertion(
						surfaceModel.getDocument(),
						fragment.getSelection().getRange().start + 2,
						this.getCaptionDocument()
					)
				);
			}
			return fragment;

		default:
			throw new Error( 'Unknown image node type ' + nodeType );
	}
};

/**
 * Get linear data representation of the image
 *
 * @return {Array} Linear data
 */
ve.dm.PMGAnnotatedImageModel.prototype.getData = function () {
	var data,
		originalAttrs = ve.copy( this.getOriginalImageAttributes() ),
		editAttributes = $.extend( originalAttrs, this.getUpdatedAttributes() ),
		nodeType = this.getImageNodeType();

	// Remove old classes
	delete editAttributes.originalClasses;
	delete editAttributes.unrecognizedClasses;
	// Newly created images must have valid URLs, so remove the error attribute
	if ( this.isChangedImageSource() ) {
		delete editAttributes.isError;
	}

	data = [
		{
			type: nodeType,
			attributes: editAttributes
		},
		{ type: '/' + nodeType }
	];

	if ( nodeType === 'mwBlockImage' ) {
		data.splice( 1, 0, { type: 'mwImageCaption' }, { type: '/mwImageCaption' } );
	}
	return data;
};

/**
 * Return all updated attributes that belong to the node.
 *
 * @return {Object} Updated attributes
 */
ve.dm.PMGAnnotatedImageModel.prototype.getUpdatedAttributes = function () {
	var attrs, currentDimensions,
		origAttrs = this.getOriginalImageAttributes();

	// Adjust default dimensions if size is set to default
	if ( this.scalable.isDefault() && this.scalable.getDefaultDimensions() ) {
		currentDimensions = this.scalable.getDefaultDimensions();
	} else {
		currentDimensions = this.getCurrentDimensions();
	}

	attrs = {
		mediaClass: this.getMediaClass(),
		type: this.getType(),
		width: currentDimensions.width,
		height: currentDimensions.height,
		defaultSize: this.isDefaultSize(),
		borderImage: this.hasBorder()
	};

	if ( origAttrs.alt !== undefined || this.getAltText() !== '' ) {
		attrs.alt = this.getAltText();
	}

	if ( this.isDefaultAligned() ) {
		attrs.align = 'default';
	} else if ( !this.isAligned() ) {
		attrs.align = 'none';
	} else {
		attrs.align = this.getAlignment();
	}

	attrs.src = this.getImageSource();
	attrs.href = this.getImageHref();
	attrs.resource = this.getImageResourceName();

	// If converting from block to inline, set isLinked=true to avoid |link=
	if ( origAttrs.isLinked === undefined && this.getImageNodeType() === 'mwInlineImage' ) {
		attrs.isLinked = true;
	}

	return attrs;
};

/**
 * set json annotated content
 *
 * @param {string} jsonData
 */
ve.dm.PMGAnnotatedImageModel.prototype.setJsonData = function ( jsonData ) {
	this.jsonData = jsonData;
};

/**
 * get json annotated content
 *
 * @return {string} jsonData
 */
ve.dm.PMGAnnotatedImageModel.prototype.getJsonData = function ( ) {
	return this.jsonData ;
};
/**
 * set annotated thumb url
 *
 * @param {string} thumbUrl
 */
ve.dm.PMGAnnotatedImageModel.prototype.setThumbUrl = function ( thumbUrl ) {
	this.thumbUrl = thumbUrl;
};

/**
 * get annotated thumb url
 *
 * @return {string} thumbUrl
 */
ve.dm.PMGAnnotatedImageModel.prototype.getThumbUrl = function ( ) {
	return this.thumbUrl ;
};


/**
 * Get the default alignment according to the document direction
 *
 * @param {string} [imageNodeType] Optional. The image node type that we would
 * like to get the default direction for. Supplying this parameter allows us
 * to check what the default alignment of a specific type of node would be.
 * If the parameter is not supplied, the default alignment will be calculated
 * based on the current node type.
 * @return {string} Node alignment based on document direction
 */
ve.dm.PMGAnnotatedImageModel.prototype.getDefaultDir = function ( imageNodeType ) {
	imageNodeType = imageNodeType || this.getImageNodeType();

	if ( this.parentDoc.getDir() === 'rtl' ) {
		// Assume position is 'left'
		return ( imageNodeType === 'mwBlockImage' ) ? 'left' : 'none';
	} else {
		// Assume position is 'right'
		return ( imageNodeType === 'mwBlockImage' ) ? 'right' : 'none';
	}
};

