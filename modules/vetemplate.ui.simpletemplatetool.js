
/**
 * UserInterface comment tool.
 *
 * @class
 * @extends ve.ui.FragmentInspectorTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.SimpleTemplateTool = function VeUiSimpleTemplateTool() {
	ve.ui.SimpleTemplateTool.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.SimpleTemplateTool, ve.ui.FragmentInspectorTool );
ve.ui.SimpleTemplateTool.static.name = 'simpletemplatetool';
ve.ui.SimpleTemplateTool.static.group = 'meta';
ve.ui.SimpleTemplateTool.static.icon = 'notice';
ve.ui.SimpleTemplateTool.static.title =
	OO.ui.deferMsg( 'visualeditor-commentinspector-tooltip' );
ve.ui.SimpleTemplateTool.static.modelClasses = [ ve.dm.MWTransclusionNode ];
ve.ui.SimpleTemplateTool.static.commandName = 'simpletemplatetool';
ve.ui.SimpleTemplateTool.static.deactivateOnSelect = true;
ve.ui.toolFactory.register( ve.ui.SimpleTemplateTool );


/**
 * The command is the one executed on edit click, 
 * (as insctructed in the SimpleTemplateContextItem )
 * it opens the simpletemplateinspector to edit the node
 */
ve.ui.commandRegistry.register(
	new ve.ui.Command(
		'simpletemplatecommand', 'window', 'open',
		{ args: [ 'simpletemplateinspector' ], supportedSelections: [ 'linear' ] }
	)
);