/*!
 * VisualEditor MediaWiki media dialog tool classes.
 *
 *
 * tool is the object (linked to a command) which can be add to the toolbar in VE
 *
 * @copyright 2011-2018 VisualEditor Team and others; see AUTHORS.txt
 * @license The MIT License (MIT); see LICENSE.txt
 */

/**
 * MediaWiki UserInterface media edit tool.
 *
 * @class
 * @extends ve.ui.FragmentWindowTool
 * @constructor
 * @param {OO.ui.ToolGroup} toolGroup
 * @param {Object} [config] Configuration options
 */
ve.ui.PMGMediaDialogTool = function VeUiPMGMediaDialogTool() {
	ve.ui.PMGMediaDialogTool.super.apply( this, arguments );
};
OO.inheritClass( ve.ui.PMGMediaDialogTool, ve.ui.FragmentWindowTool );
ve.ui.PMGMediaDialogTool.static.name = 'mediapmg';
ve.ui.PMGMediaDialogTool.static.group = 'object';
ve.ui.PMGMediaDialogTool.static.icon = 'image';
ve.ui.PMGMediaDialogTool.static.title =
	OO.ui.deferMsg( 'visualeditor-dialogbutton-media-tooltip' );
ve.ui.PMGMediaDialogTool.static.modelClasses = [ ve.dm.PMGAnnotatedImageModel, ve.dm.AnnotatedImageTransclusionNode, ve.dm.MWBlockImageNode, ve.dm.MWInlineImageNode ];
ve.ui.PMGMediaDialogTool.static.commandName = 'mediapmg';
ve.ui.PMGMediaDialogTool.static.autoAddToCatchall = false;
ve.ui.PMGMediaDialogTool.static.autoAddToGroup = false;
ve.ui.toolFactory.register( ve.ui.PMGMediaDialogTool );

ve.ui.commandRegistry.register(
	new ve.ui.Command(
		'mediapmg', 'window', 'open',
		{ args: [ 'media-dialog' ], supportedSelections: [ 'linear' ] }
	)
);
