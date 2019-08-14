<?php
namespace VeTemplates;

class Hooks {

	public static function start() {
		global $wgOut;
		$wgOut->addModules( [
				'ext.vetemplates.init',
				'ext.geshi.visualEditor'
		] );
		$wgOut->addModuleStyles( [
				'ext.vetemplates.css'
		] );
	}
}