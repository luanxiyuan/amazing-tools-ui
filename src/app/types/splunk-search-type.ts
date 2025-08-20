export interface SplunkConfig {
    splunk: {
        [key: string]:{
            envRoot: {
                [key: string]: {
                    label: string,
                    uri: {
                        [key: string]: string
                    }
                }
            },
            application: {
                [key: string]: string
            },
            market: {
                [key: string]: string
            },
            username: {
                [key: string]: string
            },
            diySearchLanguage: {
                [key: string]: string
            },
            cif: {
                [key: string]: string
            },
            httpStatus: {
                [key: string]: string
            },
            period: {
                [key: string]: string
            }
        }
    }
}

export interface ApiDetailModel {
    eventType?:string;
    uri?:string;
    comments?:string;
    rowspan?: number;
}

export interface SplunkSearchData {
    moduleName?: string;
    screenName?: string;
    uri?: string;
    envRoot?: string;
    application?: string;
    market?: string;
    username?: string;
    cif?: string;
    httpStatus?: string;
    period?: string;
    diySearchLanguage?: string;
}