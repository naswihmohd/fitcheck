import logo from '/apple-touch-icon.png'

export class Constants {
    static readonly META_TITLE_APP = 'OnRevv Leads Management';
    static readonly META_DESCRIPTION_APP =
        'Manage leads, follow-ups, and your sales pipeline with OnRevv Leads Management.';
    static readonly APP_NAME = 'OnRevv Leads Management';
    static readonly APP_SHORT_NAME = 'OnRevv Leads';

    static readonly APP_LOGO = logo;
    static readonly WEB_VERSION = 'v1.0.0';
}



// ALSO UPDATE == src/firebaseConfig.ts and public/firebase-messaging-sw.js