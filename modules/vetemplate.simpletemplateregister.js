

vetemplate.simpleTemplateRegister = {

		registerTemplate: function(templateName, icon) {
			// 2 element in this array : the element opening the translcusion block,
			// and the one closing it (with '/' ahead)
			if ( !icon ) {
				icon = 'template';
			}
			var templateInfo = [ {
				//type: 'mwTransclusionBlock',
				type: 'simpleTransclusion',
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
				//type: '/mwTransclusionBlock'
				type: '/simpleTransclusion'
			} ];

			var commandName = templateName.toLowerCase().replace(/[^a-z]/g, "") + 'block';

			ve.ui.commandRegistry.register(
				new ve.ui.Command( commandName, 'simpletemplateaction', 'insert', {
					args: [ templateInfo, false, false ],
					supportedSelections: [ 'linear' ]
				} )
			);

			//Create and register tool
			// tools are used only to add button in the toolbar
			function MyToolInfo() {
				MyToolInfo.parent.apply( this, arguments );
			}
			OO.inheritClass( MyToolInfo, ve.ui.MWTransclusionDialogTool );

			var templateTitle = mw.msg('vetemplate-templatetitle-' + templateName.toLowerCase());

			MyToolInfo.static.name = commandName;
			MyToolInfo.static.group = 'object';
			MyToolInfo.static.icon = icon;
			MyToolInfo.static.title = templateTitle;
			MyToolInfo.static.commandName = commandName;
			ve.ui.toolFactory.register( MyToolInfo );

		}

};


