
vetemplate = vetemplate || {};
vetemplate.imageAnnotator = vetemplate.imageAnnotator || {};

// this was to load template for annotated image
// it seems not used anymore, this must be checked
// and delete if needed

vetemplate.iaTemplateRegister = {

		registerTemplate: function(icon) {
			if ( !icon ) {
				icon = 'media';
			}
			var targetWt = '';
			var hash = '';
			var jsondata = '';

			var templateInfo = [ {
				type: 'annotatedImageTransclusion',
				attributes: {
					mw: {
						parts: [ {
							template: {
								target: {
									'function': 'annotatedImageLight',
									wt: targetWt
								},
								params: {
									hash: {
										wt: hash
									},
									jsondata: {
										wt: jsondata
									}
								}
							}
						} ]
					}
				}
			}, {
				//type: '/mwTransclusionBlock'
				type: '/annotatedImageTransclusion'
				//type: '/simpleTransclusion',
			} ];


			var commandName = 'mediapmg';

			ve.ui.commandRegistry.register(
				new ve.ui.Command( commandName, 'simpletemplateaction', 'insert', {
					args: [ templateInfo, false, false ],
					supportedSelections: [ 'linear' ]
				} )
			);
		}

};


