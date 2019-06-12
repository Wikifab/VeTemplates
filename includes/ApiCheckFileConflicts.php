<?php
namespace VeTemplates;

use Title;
use ContentHandler;
use WikiPage;
use ApiBase;
use LocalFile;
use RepoGroup;
use FSFile;

class ApiCheckFileConflicts extends ApiBase {

	public function __construct($query, $moduleName) {
		parent::__construct ( $query, $moduleName );
	}

	public function getAllowedParams()
    {
        return array (
			'file' => array ( // search value
					ApiBase::PARAM_TYPE => 'upload',
					ApiBase::PARAM_REQUIRED => true
			),
			'filename' => array ( // search value
					ApiBase::PARAM_TYPE => 'string',
					ApiBase::PARAM_REQUIRED => true
			)
		);
    }

	public function getParamDescription() {
		return [ ];
	}
	public function getDescription() {
		return false;
	}
	public function execute() {

		// get params
		$this->file = $this->getMain()->getUpload( 'file' );
		$this->filename = $this->getMain()->getVal( 'filename' );

		$res = array();

		// let's check whether a file with same name exists
		$title = Title::newFromText($this->filename);
		$fileWithSameName = RepoGroup::singleton()->findFile( $title );

		if ($fileWithSameName) {
			$res['type'] = 'conflictingname';
			$this->getResult()->addValue ( null, $this->getModuleName(), $res );
			return;
		}

		// okay, then check whether file already exists (with hash)
		$hash = FSFile::getSha1Base36FromPath( $this->file->getTempName() );

		$dupes = RepoGroup::singleton()->findBySha1( $hash );

		if (!empty($dupes)) {

			$dupesInfos = array();

			foreach ($dupes as $key => $dupe){
				if ($dupe instanceof LocalFile) {
					$imageInfo = $this->getImageInfo($dupe);
					if ($imageInfo) {
						$dupesInfos[] = $imageInfo;
					}
				}
			}

			if (!empty($dupesInfos)) {
				$res['type'] = 'fileexists';
				$res['dupes'] = $dupesInfos;
				$this->getResult()->addValue ( null, $this->getModuleName(), $res );
				return;
			}
		}

		// everything's okay
		$res['type'] = 'noconflict';
		$this->getResult()->addValue ( null, $this->getModuleName(), $res );
			return;
	}

	/**
	 * Execute a request to the API within mediawiki using FauxRequest
	 *
     * @param $data array Array of non-urlencoded key => value pairs, the fake GET/POST values
     * @param $wasPosted bool Whether to treat the data as POST
     * @param $session MediaWiki\\Session\\Session | array | null Session, session data array, or null
     * @param $protocol string 'http' or 'https'
     * @return array the result data array
     *
	 * @see https://doc.wikimedia.org/mediawiki-core/master/php/classFauxRequest.html
	 */
	private function getImageInfo(LocalFile $file){

		$filename = $file->getTitle()->getPrefixedText();

		$requestParams = array();

		$requestParams['iiprop'] = 'timestamp|user|url|mediatype|mime|userid|comment|parsedcomment|canonicaltitle|size|dimensions|sha1|thumbmime|metadata|commonmetadata|extmetadata|archivename|bitdepth|uploadwarning|badfile';
		$requestParams['action'] = 'query';
		$requestParams['prop'] = 'imageinfo';
		$requestParams['titles'] = $filename;

		$res = array();

		$apiParams = new \FauxRequest($requestParams, false, null, 'http');

		try {
			$api = new \ApiMain( $apiParams );
			$api->execute();
			$res = $api->getResult()->getResultData();
		} catch (\Exception $e) {
			trigger_error("API exception : " . $e->getMessage(), E_USER_WARNING);
		}

		if ($res['query']['pages']) {
			$first = array_values($res['query']['pages'])[0];

			return $first['imageinfo'][0];
		}

		return false;
	}

	public function needsToken() {
		return 'csrf';
	}
}