/**
 * this file is a hack to change MWMediaTransferHandler function ,
 * to use "media-dialog" defined in veTemplate  instead of "media"
 * when coping media in VE
 */


ve.ui.MWMediaTransferHandler.prototype.process = function () {
	var action,
		file = this.item.getAsFile();

	action = ve.ui.actionFactory.create( 'window', this.surface );
	action.open( 'media-dialog', { file: file } );

	this.insertableDataDeferred.reject();
};