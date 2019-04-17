
// hack to fix sizing issues

ve.ui.MediaSizeWidget.prototype.setCurrentDimensions = function ( dimensions ) {
	var normalizedDimensions;

	console.log("MediaSizeWidget.setCurrentDimensions hasked");
	console.log(dimensions);
	// Recursion protection
	if ( this.preventChangeRecursion ) {
		return;
	}
	this.preventChangeRecursion = true;

	if ( !this.scalable.isFixedRatio() ) {
		dimensions = ve.extendObject( {}, this.getCurrentDimensions(), dimensions );
	}

	// Normalize the new dimensions
	normalizedDimensions = ve.dm.Scalable.static.getDimensionsFromValue( dimensions, this.scalable.getRatio() );

	console.log(normalizedDimensions);
	if ( normalizedDimensions.height === 0) {
		normalizedDimensions.height = 1;
	}
	if (normalizedDimensions.width === 0) {
		normalizedDimensions.width = 1;
	}
	console.log(normalizedDimensions);

	if (
		// Update only if the dimensions object is valid
		ve.dm.Scalable.static.isDimensionsObjectValid( normalizedDimensions ) &&
		// And only if the dimensions object is not default
		!this.scalable.isDefault()
	) {
		this.currentDimensions = normalizedDimensions;
		console.log(normalizedDimensions);
		// This will only update if the value has changed
		// Set width & height individually as they may be 0
		this.dimensionsWidget.setWidth( this.currentDimensions.width );
		this.dimensionsWidget.setHeight( this.currentDimensions.height );

		// Update scalable object
		this.scalable.setCurrentDimensions( this.currentDimensions );

		this.validateDimensions();
		// Emit change event
		this.emit( 'change', this.currentDimensions );
	}
	this.preventChangeRecursion = false;
};