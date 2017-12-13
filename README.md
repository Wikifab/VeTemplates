# VE Templates


Description
===============

This mediawiki extension add templates in the Visual editor.
It works with the Visual Editor in PageForms. (forked version of PageForms by wikifab)

Installation
===============

1. clone VeTemplates into the 'extensions' directory of your mediawiki installation
2. add the folling Line to your LocalSettings.php file :
> wfLoadExtension('VeTemplates');

To be in the toolbar, they must be calle in the toolbar declaration in VE : 
example : 
		{
			header: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
			title: OO.ui.deferMsg( 'visualeditor-toolbar-insert' ),
			type: 'list',
			icon: 'add',
			label: '',
			include: [  'warningblock','infoblock', 'ideablock']
		},
		
		

Usage
===============

Currently, simple template are created for 3 templates (Info, Warning, and Idea)
tu use them, you must create the wikipage template (ex: page Template:Idea )
They are added to the VE tolbar so you can add it into the editor. Then by clicking on the template, you can edit his content.




Example
===============
http://wikifab.org


MediaWiki Versions
===============
Version 1.0 of this extension has been tested on MediaWiki version 1.29 
