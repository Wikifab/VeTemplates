
vetemplate =  {};

vetemplate.simpleTemplateRegister = {
		
		registerTemplate: function(templateName) {
			var templateInfo = [ {
				type: 'mwTransclusionBlock',
				attributes: {
					mw: {
						parts: [ {
							template: {
								target: {
									href: 'Template:' + templateName,
									wt: templateName
								},
								params: {
									1: {
										wt: '...'
									}
								}
							}
						} ]
					}
				}
			}, {
				type: '/mwTransclusionBlock'
			} ];
			
			var commandName = templateName.toLowerCase().replace(/[^a-z]/g, "") + 'block';
			
			ve.ui.commandRegistry.register(
				new ve.ui.Command( commandName, 'content', 'insert', {
					args: [ templateInfo, false, true ],
					supportedSelections: [ 'linear' ]
				} )
			);
			
			//Create and register tool
			function MyToolInfo() {
				MyToolInfo.parent.apply( this, arguments );
			}
			OO.inheritClass( MyToolInfo, ve.ui.MWTransclusionDialogTool );

			MyToolInfo.static.name = commandName;
			MyToolInfo.static.group = 'object';
			MyToolInfo.static.title = templateName;
			MyToolInfo.static.commandName = commandName;
			ve.ui.toolFactory.register( MyToolInfo );
			
		}

};


