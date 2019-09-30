
vetemplate = vetemplate || {};
vetemplate.imageAnnotator = vetemplate.imageAnnotator || {};

vetemplate.iaTemplateRegister = {

		registerTemplate: function(icon = 'media') {

			var targetWt = '';
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


