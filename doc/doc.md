## Archi technique

### ve.ce

modèle de données

### ve.dm 

le model de donnée ve, il modèlise les donnée, une image sera par exemple représenté par: (résultat de la méthode getData() )

	data = [
		{
			type: 'mwBlockImage',
			attributes: editAttributes
		},
		{ type: '/mwBlockImage' }
	];
	
ou :

	data = [
		{
			type: 'mwBlockImage',
			attributes: editAttributes
		},
		{ type: 'mwImageCaption' },
		{ type: '/mwImageCaption' },
		{ type: '/mwBlockImage' }
	];
	
du coup, il faudrai représenter les images annotées comme cela :

	data = [
		{
			type: 'pmgBlockImage',
			attributes: annottatedInfo
		},
		{
			type: 'mwBlockImage',
			attributes: editAttributes
		},
		{ type: 'mwImageCaption' },
		{ type: '/mwImageCaption' },
		{ type: '/mwBlockImage' },
		{ type: '/pmgBlockImage' }
	];

### a propos de 'type' dans le data :

il doit correspondre au 'name' d'une classe ve.dm.* qui a été enregistré via 
ve.dm.modelRegistry.register( ve.dm.<className> );

## fonctionnement :

### lien ve.ui -> ve.dm
ve.ui.MwMediaDialog  possède un model ve.dm.MWImageModel
elle va appeller les methodes suivantes : 

création : 
* this.imageModel = ve.dm.MWImageModel.static.newFromImageAttributes()
* ve.dm.MWImageModel.static.newFromImageNode( this.selectedNode )

connect to the dialog
* this.imageModel.disconnect( this )
* this.imageModel.connect(...)

modification du modèle : 
* this.imageModel.changeImageSource
* this.imageModel.setType( type )
* this.imageModel.setAlignment( newPositionValue );
* this.imageModel.toggleBorder( isSelected );
* this.imageModel.setAltText( text );
* this.imageModel.storeInitialHash( this.imageModel.getHashObject() );

to update an image node 
this.imageModel.updateImageNode( this.selectedNode, surfaceModel );

Replacing an image or inserting a brand new one
this.fragment = this.imageModel.insertImageNode( this.getFragment() );

info sur le modèle :
* this.imageModel.getFilename()
* this.imageModel.isBorderable()
* this.imageModel.hasBorder()
* this.imageModel.getHashObject()
* this.imageModel.getAlignment()
* newPositionValue = this.imageModel.getDefaultDir( 'mwBlockImage' );
* this.imageModel.getType()
* this.imageModel.hasBeenModified()
* this.imageModel.getScalable()
* this.imageModel.isDefaultSize()
....


# structure HTML :

Image simple : 
	<figure class="mw-default-size" typeof="mw:Image/Thumb" >
		<a href="./Fichier:IMP3D_Step_053.jpg" >
			<img resource="./Fichier:IMP3D_Step_053.jpg" src="//demo-dokit.localtest.me/w/images/0/00/IMP3D_Step_053.jpg" data-file-width="600" data-file-height="400" data-file-type="bitmap" height="400" width="600"/>
		</a>
	</figure>

Image Annotée : 
	<div class="annotatedImageContainer" typeof="mw:Transclusion" >
		<figure-inline class="mw-default-size" typeof="mw:Image/Frameless">
			<a href="./Fichier:L'usage_des_sp\u00e9ciaux_d_une_tron_oneuse.jpg">
				<img resource="./Fichier:L'usage_des_sp\u00e9ciaux_d_une_tron_oneuse.jpg" src="//demo-dokit.localtest.me/w/images/thumb/b/b8/L%27usage_des_sp%C3%A9ciaux_d_une_tron_oneuse.jpg/800px-L%27usage_des_sp%C3%A9ciaux_d_une_tron_oneuse.jpg" data-file-width="1440" data-file-height="805" data-file-type="bitmap" height="447" width="800"/>
			</a>
		</figure-inline>
		<div class="annotatedcontent" data-annotatedcontent=""> 
		</div>
	</div>






