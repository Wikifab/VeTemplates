/**
 * this file is a hack to avoid MWTransclusionContextItem to be compatible with the same
 * objects than SimpleTemplateContextItem
 */


ve.ui.MWTransclusionContextItem.static.isCompatibleWith = function ( model ) {


    var compaSimpleTemplate = ve.ui.SimpleTemplateContextItem.static.isCompatibleWith(model);
    if (compaSimpleTemplate) {
    	return false;
    }
    var compaAnnotatedTemplate = ve.ui.AnnotatedImageContextItem.static.isCompatibleWith(model);
    if (compaAnnotatedTemplate) {
    	return false;
    }

    return ve.ui.MWTransclusionContextItem.super.static.isCompatibleWith.call( this, model );

};