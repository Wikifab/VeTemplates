/* global moment, Uint8Array */
( function ( $, mw ) {


	mw.VeTemplateUpload = mw.VeTemplateUpload || {};
	/**
	 * mw.VeTemplateUpload.BookletLayout encapsulates the process
	 * of uploading a file to MediaWiki using the mw.ForeignStructuredUpload model.
	 *
	 *     var uploadDialog = new mw.Upload.Dialog( {
	 *         bookletClass: mw.VeTemplateUpload.BookletLayout,
	 *         booklet: {
	 *             target: 'local'
	 *         }
	 *     } );
	 *     var windowManager = new OO.ui.WindowManager();
	 *     $( 'body' ).append( windowManager.$element );
	 *     windowManager.addWindows( [ uploadDialog ] );
	 *
	 * @class mw.VeTemplateUpload.BookletLayout
	 * @uses mw.ForeignStructuredUpload
	 * @extends mw.Upload.BookletLayout
	 *
	 * @constructor
	 * @param {Object} config Configuration options
	 * @cfg {string} [target] Used to choose the target repository.
	 *     If nothing is passed, the {@link mw.ForeignUpload#property-target default} is used.
	 */
	mw.VeTemplateUpload.BookletLayout = function ( config ) {
		config = config || {};
		// Parent constructor
		mw.VeTemplateUpload.BookletLayout.parent.call( this, config );

		this.target = config.target;
	};

	/* Setup */

	//OO.inheritClass( mw.ForeignStructuredUpload.BookletLayout, mw.Upload.BookletLayout );
	OO.inheritClass( mw.VeTemplateUpload.BookletLayout, mw.ForeignStructuredUpload.BookletLayout );

	/* Uploading */

	/**
	 * @inheritdoc
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.initialize = function () {
		var booklet = this;


		return mw.VeTemplateUpload.BookletLayout.parent.prototype.initialize.call( this ).then(
			function () {
				return $.when(
					/*
					// Point the CategoryMultiselectWidget to the right wiki
					booklet.upload.getApi().then( function ( api ) {
						// If this is a ForeignApi, it will have a apiUrl, otherwise we don't need to do anything
						if ( api.apiUrl ) {
							// Can't reuse the same object, CategoryMultiselectWidget calls #abort on its mw.Api instance
							booklet.categoriesWidget.api = new mw.ForeignApi( api.apiUrl );
						}
						return $.Deferred().resolve();
					} ),
					// Set up booklet fields and license messages to match configuration
					booklet.upload.loadConfig().then( function ( config ) {
						var
							msgPromise,
							isLocal = booklet.upload.target === 'local',
							fields = config.fields,
							msgs = config.licensemessages[ isLocal ? 'local' : 'foreign' ];

						// Hide disabled fields
						booklet.descriptionField.toggle( !!fields.description );
						booklet.categoriesField.toggle( !!fields.categories );
						booklet.dateField.toggle( !!fields.date );
						// Update form validity
						booklet.onInfoFormChange();

						// Load license messages from the remote wiki if we don't have these messages locally
						// (this means that we only load messages from the foreign wiki for custom config)
						if ( mw.message( 'upload-form-label-own-work-message-' + msgs ).exists() ) {
							msgPromise = $.Deferred().resolve();
						} else {
							msgPromise = booklet.upload.apiPromise.then( function ( api ) {
								return api.loadMessages( [
									'upload-form-label-own-work-message-' + msgs,
									'upload-form-label-not-own-work-message-' + msgs,
									'upload-form-label-not-own-work-local-' + msgs
								] );
							} );
						}

						// Update license messages
						return msgPromise.then( function () {
							var $labels;
							booklet.$ownWorkMessage.msg( 'upload-form-label-own-work-message-' + msgs );
							booklet.$notOwnWorkMessage.msg( 'upload-form-label-not-own-work-message-' + msgs );
							booklet.$notOwnWorkLocal.msg( 'upload-form-label-not-own-work-local-' + msgs );

							$labels = $( [
								booklet.$ownWorkMessage[ 0 ],
								booklet.$notOwnWorkMessage[ 0 ],
								booklet.$notOwnWorkLocal[ 0 ]
							] );

							// Improve the behavior of links inside these labels, which may point to important
							// things like licensing requirements or terms of use
							$labels.find( 'a' )
								.attr( 'target', '_blank' )
								.on( 'click', function ( e ) {
									// OO.ui.FieldLayout#onLabelClick is trying to prevent default on all clicks,
									// which causes the links to not be openable. Don't let it do that.
									e.stopPropagation();
								} );
						} );
					}, function ( errorMsg ) {
						booklet.getPage( 'upload' ).$element.msg( errorMsg );
						return $.Deferred().resolve();
					} )
					*/

				);
			}
		).catch(
			// Always resolve, never reject
			function () { return $.Deferred().resolve(); }
		);


	};

	/* Form renderers */

	/**
	 * @inheritdoc
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.renderUploadForm = function () {
		var fieldset,
			layout = this;

		// These elements are filled with text in #initialize
		// TODO Refactor this to be in one place
		this.$ownWorkMessage = $( '<p>' )
			.addClass( 'mw-foreignStructuredUpload-bookletLayout-license' );
		this.$notOwnWorkMessage = $( '<p>' );
		this.$notOwnWorkLocal = $( '<p>' );

		this.selectFileWidget = new OO.ui.SelectFileWidget( {
			showDropTarget: true
		} );
		this.messageLabel = new OO.ui.LabelWidget( {
			label: $( '<div>' ).append(
				this.$notOwnWorkMessage,
				this.$notOwnWorkLocal
			)
		} );
		this.ownWorkCheckbox = new OO.ui.CheckboxInputWidget().on( 'change', function ( on ) {
			layout.messageLabel.toggle( !on );
		} );

		this.ownWorkCheckbox.setSelected( true );

		fieldset = new OO.ui.FieldsetLayout();
		fieldset.addItems( [
			new OO.ui.FieldLayout( this.selectFileWidget, {
				align: 'top'
			} ),
			new OO.ui.FieldLayout( this.ownWorkCheckbox, {
				align: 'inline',
				label: $( '<div>' ).append(
					$( '<p>' ).text( mw.msg( 'upload-form-label-own-work' ) ),
					this.$ownWorkMessage
				)
			} ),
			new OO.ui.FieldLayout( this.messageLabel, {
				align: 'top'
			} )
		] );
		this.uploadForm = new OO.ui.FormLayout( { items: [ fieldset ] } );

		// Validation
		this.selectFileWidget.on( 'change', this.onUploadFormChange.bind( this ) );
		this.ownWorkCheckbox.on( 'change', this.onUploadFormChange.bind( this ) );

		this.selectFileWidget.on( 'change', function () {
			var file = layout.getFile();

			// Set the date to lastModified once we have the file
			if ( layout.getDateFromLastModified( file ) !== undefined ) {
				layout.dateWidget.setValue( layout.getDateFromLastModified( file ) );
			}

			// Check if we have EXIF data and set to that where available
			layout.getDateFromExif( file ).done( function ( date ) {
				layout.dateWidget.setValue( date );
			} );

			layout.updateFilePreview();
		} );




		// changed in VeTemplate :
		//this.ownWorkCheckbox.$element.hide();

		return this.uploadForm;
	};

	/**
	 * @inheritdoc
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.renderInfoForm = function () {
		var fieldset;

		this.filePreview = new OO.ui.Widget( {
			classes: [ 'mw-upload-bookletLayout-filePreview' ]
		} );
		this.progressBarWidget = new OO.ui.ProgressBarWidget( {
			progress: 0
		} );
		this.filePreview.$element.append( this.progressBarWidget.$element );

		this.filenameWidget = new OO.ui.TextInputWidget( {
			required: true,
			validate: /.+/
		} );
		this.descriptionWidget = new OO.ui.MultilineTextInputWidget( {
			required: true,
			validate: /\S+/,
			autosize: true
		} );
		this.categoriesWidget = new mw.widgets.CategoryMultiselectWidget( {
			// Can't be done here because we don't know the target wiki yet... done in #initialize.
			// api: new mw.ForeignApi( ... ),
			$overlay: this.$overlay
		} );
		this.dateWidget = new mw.widgets.DateInputWidget( {
			$overlay: this.$overlay,
			required: true,
			mustBeBefore: moment().add( 1, 'day' ).locale( 'en' ).format( 'YYYY-MM-DD' ) // Tomorrow
		} );

		this.filenameField = new OO.ui.FieldLayout( this.filenameWidget, {
			label: mw.msg( 'upload-form-label-infoform-name' ),
			align: 'top',
			classes: [ 'mw-foreignStructuredUploa-bookletLayout-small-notice' ],
			notices: [ mw.msg( 'upload-form-label-infoform-name-tooltip' ) ]
		} );
		this.descriptionField = new OO.ui.FieldLayout( this.descriptionWidget, {
			label: mw.msg( 'upload-form-label-infoform-description' ),
			align: 'top',
			classes: [ 'mw-foreignStructuredUploa-bookletLayout-small-notice' ],
			notices: [ mw.msg( 'upload-form-label-infoform-description-tooltip' ) ]
		} );
		this.categoriesField = new OO.ui.FieldLayout( this.categoriesWidget, {
			label: mw.msg( 'upload-form-label-infoform-categories' ),
			align: 'top'
		} );
		this.dateField = new OO.ui.FieldLayout( this.dateWidget, {
			label: mw.msg( 'upload-form-label-infoform-date' ),
			align: 'top'
		} );

		fieldset = new OO.ui.FieldsetLayout( {
			label: mw.msg( 'upload-form-label-infoform-title' )
		} );
		fieldset.addItems( [
			this.filenameField,
			this.descriptionField,
			this.categoriesField,
			this.dateField
		] );
		this.infoForm = new OO.ui.FormLayout( {
			classes: [ 'mw-upload-bookletLayout-infoForm' ],
			items: [ this.filePreview, fieldset ]
		} );

		// Validation
		this.filenameWidget.on( 'change', this.onInfoFormChange.bind( this ) );
		this.descriptionWidget.on( 'change', this.onInfoFormChange.bind( this ) );
		this.dateWidget.on( 'change', this.onInfoFormChange.bind( this ) );

		this.on( 'fileUploadProgress', function ( progress ) {
			this.progressBarWidget.setProgress( progress * 100 );
		}.bind( this ) );

		return this.infoForm;
	};

	/**
	 * @inheritdoc
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.onInfoFormChange = function () {
		var layout = this,
			validityPromises = [];

		validityPromises.push( this.filenameWidget.getValidity() );
		if ( this.descriptionField.isVisible() ) {
			validityPromises.push( this.descriptionWidget.getValidity() );
		}
		if ( this.dateField.isVisible() ) {
			validityPromises.push( this.dateWidget.getValidity() );
		}

		$.when.apply( $, validityPromises ).done( function () {
			layout.emit( 'infoValid', true );
		} ).fail( function () {
			layout.emit( 'infoValid', false );
		} );
	};


	mw.VeTemplateUpload.BookletLayout.prototype.sanitizeFilename = function(filename) {

		// we removed accents :
		var accent = [
			/[\300-\306]/g, /[\340-\346]/g, // A, a
			/[\310-\313]/g, /[\350-\353]/g, // E, e
			/[\314-\317]/g, /[\354-\357]/g, // I, i
			/[\322-\330]/g, /[\362-\370]/g, // O, o
			/[\331-\334]/g, /[\371-\374]/g, // U, u
			/[\321]/g, /[\361]/g, // N, n
			/[\307]/g, /[\347]/g, // C, c
		];
		var noaccent = [ 'A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'N',
				'n', 'C', 'c' ];
		for (var i = 0; i < accent.length; i++) {
			filename = filename.replace(accent[i], noaccent[i]);
		}

		// var invalidCharRegex = new RegExp('[\'\"]+', 'g');
		var invalidCharRegex = new RegExp('[^ a-zA-Z_0-9\-\.]+', 'g');

		if (filename.match(invalidCharRegex)) {
			filename = filename.replace(invalidCharRegex, '');
		}
		return filename;
	};

	mw.VeTemplateUpload.BookletLayout.prototype.prefixAndSanitizeFilename = function (filename) {
		// change filename, to prefix with page name :
		filename = mw.config.get('wgPageName').replace(/(.*)\//g,"").replace(":","-") + '_' + filename;

		filename = this.sanitizeFilename(filename);

		return filename;
	};

	/**
	 * @param {mw.Title} filename
	 * @return {jQuery.Promise} Resolves (on success) or rejects with OO.ui.Error
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.generateFilename = function ( filename ) {
		// apfrom=Test%20dedie%20au%20erreurs%20Logo&apto=Test%20dedie%20au%20erreurs%20Logozz

		var booklet = this;
		filename = this.prefixAndSanitizeFilename(filename);

		// new call : search for all files with same prefix, with a number as suffix
		return ( new mw.Api() ).get( {
			action: 'query',
			prop: 'info',
			list: 'allpages',
			apnamespace: mw.config.get( 'wgNamespaceIds' ).file,
			apfrom: filename,
			apto: filename + "a",
			formatversion: 2
		} ).then(
			function ( result ) {
				// if the file already exists, reject right away, before
				// ever firing finishStashUpload()
				if ( result.query.allpages.length > 0 ) {

					// change file name :
					var filenames = result.query.allpages.map(function (value) {
						// remove namespace prefix :
						value = value.title.replace(/^([^:]+:)/, '');
						return value;
					});

					if (jQuery.inArray(filename,filenames ) !== -1) {

						// rename file by adding a number
						// TODO : calc number according to number of the last one +1
						var newFilename = filename + '_' + (result.query.allpages.length + 1);
						var extensionRegexp = /(\.[^\.]+)$/;
						if (filename.match(extensionRegexp)) {
							newFilename = filename.replace(extensionRegexp, '_' + (result.query.allpages.length + 1) + '$1');
						}
						booklet.setFilename(newFilename);
					} else {
						booklet.setFilename(filename);
					}
				} else {
					booklet.setFilename(filename);
				}
				return $.Deferred().resolve();
			},
			function () {
				// API call failed - this could be a connection hiccup...
				// Let's just ignore this validation step and turn this
				// failure into a successful resolve ;)
				booklet.setFilename(filename);
				return $.Deferred().resolve();
			}
		);
	};

	mw.VeTemplateUpload.BookletLayout.prototype.validateFilenameExists = function ( filename ) {
		// old call from validateFilename : just name file existence :
		return ( new mw.Api() ).get( {
			action: 'query',
			prop: 'info',
			titles: filename.getPrefixedDb(),
			formatversion: 2
		} ).then(
			function ( result ) {
				// if the file already exists, reject right away, before
				// ever firing finishStashUpload()
				if ( !result.query.pages[ 0 ].missing ) {
					return $.Deferred().reject( new OO.ui.Error(
						$( '<p>' ).msg( 'fileexists', filename.getPrefixedDb() ),
						{ recoverable: false }
					) );
				}
			},
			function () {
				// API call failed - this could be a connection hiccup...
				// Let's just ignore this validation step and turn this
				// failure into a successful resolve ;)
				return $.Deferred().resolve();
			}
		);
	}

	/**
	 * @param {mw.Title} filename
	 * @return {jQuery.Promise}
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.validateFilename = function ( filename ) {

		var layout = this;

		var deferred = $.Deferred();

		var file = this.getFile();

		// first request to get token
		$.ajax({
			type: "GET",
			url: mw.util.wikiScript('api'),
			data: { action:'query', format:'json',  meta: 'tokens', type:'csrf'},
		    dataType: 'json',
		    success: onTokenSuccess
		});

		function onTokenSuccess( jsondata ) {

			console.log('filename', filename);

			var token = jsondata.query.tokens.csrftoken;
			var formdata = new FormData(); //see https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
			formdata.append("action", "vetemplates_checkfileconflicts");
			formdata.append("format", "json");
			formdata.append("filename", filename.title + '.' + filename.ext);
			formdata.append("prefixedFilename", filename);
			formdata.append("token", token );
			formdata.append("file", file);

			$.ajax({ 
				type: "POST",
				url: mw.util.wikiScript('api'),
				data: formdata,
    			processData: false,
    			contentType:false
    		}).done(function(res) {

    			var res = res.vetemplates_checkfileconflicts;

    			var type = res.type;

				switch (type) {
				  case 'noconflict':
				    deferred.resolve();
				    break;
				  case 'conflictingname':
				  	layout.upload.setState( mw.Upload.State.WARNING, { conflictingname : true } );
				  	deferred.reject( new OO.ui.Error(
						$( '<p>' ).msg( 'vetemplates-filename-already-exists' ),
						{ recoverable: false }
					) );

				  	break;
				  case 'fileexists':
				  	var dupes = res.dupes;

				  	if (dupes != undefined && dupes.length > 0) {

				  		var imageInfo = dupes[0];

				  		// set the upload object state to warning and save the file's info for future use
						layout.upload.setState( mw.Upload.State.WARNING, { fileexists: true, existingfile: imageInfo } );
						layout.setPage( 'insert' );

						deferred.resolve(); // we should actually reject, but then OOUI fires a popup message
				  	}

				  	deferred.resolve();

				    break;
				  default:
				  	deferred.resolve();
				}
			})
			.fail(function(xhr, ajaxOptions, thrownError) {
				console.log("error");
				console.log(xhr);
				console.log(thrownError);
				deferred.resolve();
			});
		}

		return deferred.promise();
	};

	/**
	 * @inheritdoc
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.saveFile = function () {

		var title = mw.Title.newFromText(
			this.getFilename(),
			mw.config.get( 'wgNamespaceIds' ).file
		);

		return this.validateFilename( title )
			/* if everything went fine until here, let the parent have a word */
			.done( mw.ForeignStructuredUpload.BookletLayout.parent.prototype.saveFile.bind( this ) );
	};


	/**
	 * @inheritdoc
	 */
	/*
	mw.VeTemplateUpload.BookletLayout.prototype.saveFile = function () {
		var title = mw.Title.newFromText(
			this.getFilename(),
			mw.config.get( 'wgNamespaceIds' ).file
		);

		return this.uploadPromise
			.then( this.validateFilename.bind( this, title ) )
			.then( mw.VeTemplateUpload.BookletLayout.parent.prototype.saveFile.bind( this ) );
	};*/

	/* Getters */


	/* Setters */

	/**
	 * @inheritdoc
	 */
	mw.VeTemplateUpload.BookletLayout.prototype.clear = function () {
		mw.VeTemplateUpload.BookletLayout.parent.prototype.clear.call( this );

		this.ownWorkCheckbox.setSelected( true );
	};

}( jQuery, mediaWiki ) );
