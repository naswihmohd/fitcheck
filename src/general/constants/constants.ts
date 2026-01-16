import logo from '../../assets/images/logo.png'

export class Constants {
    static readonly META_TITLE_APP = ""
    static readonly META_DESCRIPTION_APP = "";
    static readonly APP_NAME = 'EmploTrackEZ'

    static readonly APP_LOGO = logo;
    static readonly WEB_VERSION = 'v1.0.6';
}

export class CloudFunctionsURLs {
    static readonly CREATE_LOGIN_USER = 'https://createloginuser-kh5r4s6x4q-uc.a.run.app';
    static readonly SEND_NOTIFICATION = 'https://sendnotification-kh5r4s6x4q-uc.a.run.app';
    static readonly CREATE_TUTOR = 'https://createtutor-kh5r4s6x4q-uc.a.run.app';
}


// ALSO UPDATE == src/firebaseConfig.ts and public/firebase-messaging-sw.js