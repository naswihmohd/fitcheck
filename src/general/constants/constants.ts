import logo from '../../assets/images/logo.png'

export class Constants {
    static readonly META_TITLE_APP = ""
    static readonly META_DESCRIPTION_APP = "";
    static readonly APP_NAME = 'Edwin Academy'

    static readonly APP_LOGO = logo;
    static readonly WEB_VERSION = 'v1.0.6';
}

export class CloudFunctionsURLs {
    static readonly CREATE_BRANCH = 'https://createbranch-tn3gt67nzq-uc.a.run.app';
    static readonly CREATE_EXECUTIVE = 'https://addexecutive-tn3gt67nzq-uc.a.run.app';
    static readonly IMPORT_LEADS = 'https://importleadfromexcel-tn3gt67nzq-uc.a.run.app';
    static readonly EXPORT_LEADS_IN_EXCEL_FORMAT = 'https://exportleadsexcelformat-tn3gt67nzq-uc.a.run.app';
    static readonly META_INITIATE = 'https://metainitiate-tn3gt67nzq-uc.a.run.app';
    static readonly META_SUBSCRIBE_PAGE = 'https://metasubscribepage-tn3gt67nzq-uc.a.run.app';
}


// ALSO UPDATE == src/firebaseConfig.ts and public/firebase-messaging-sw.js