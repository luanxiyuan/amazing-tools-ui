import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { FileToolService } from "./file-tool.service";
import { SplunkConfig, SplunkSearchData } from "../../types/splunk-search-type";
@Injectable({
    providedIn: 'root'
})
export class SplunkSearchService {
    public config: SplunkConfig = {} as SplunkConfig;
    
    constructor(
        private fileToolService: FileToolService
    ) {
        
    }

    public getConfig(): Observable<any> {
        return Observable.create((observer: any) => {
            this.fileToolService.loadSplunkConfigFile().subscribe((res: any) => {
                this.config = res as SplunkConfig;
                observer.next(res);
                observer.complete()    
            })
        })
    }

    public isEMEAMarket(market: string): boolean {
        return ["AE", "PL", "RU", "UK"].includes(market as string);
    }

    public isSpecificGMIndexValueMarket(market: string): boolean {
        return ["AU", "HK", "SG"].includes(market as string);
    }

    public buildSplunkSearchLanguage(data: SplunkSearchData, channelId: string) {
        let searchCommand = 'search ';
        let formatedUri = '';
        if (data.uri) {
            formatedUri = data.uri.replace('/GMP/REST/globalMobile/api/uris.jws', '');
            formatedUri = '*' + formatedUri.replace(/\{\w+\}/g, '{*}');
        }
        // CAPI
        if (data.application === 'ESB') {
            // EMEA (this was merged to the same search params as APAC)
            // if(this.isEMEAMarket(data.market as string)) {
            //     searchCommand += `index=int_gcg_*esb* AND sourcetype=API_AUDIT_7 ${data.market ? 'AND LogInfo.Header.CountryCode=' + data.market.toUpperCase() : ''} `
            //     + `${channelId === 'MBOL' ? 'AND LogInfo.AdditionalInformation.channelId=MBK ' : 'AND LogInfo.AdditionalInformation.channelId=HBK '} `
            //     + `${data.uri ? 'AND LogInfo.Header.UriTemplate=' + formatedUri : ''} `
            //     + `${data.cif ? 'AND LogInfo.AdditionalInformation.i-cif=' + data.cif.trim() : ''} `
            //     + `${data.diySearchLanguage?.trim() ? (data.diySearchLanguage?.trim().startsWith('AND') ? data.diySearchLanguage?.trim() : 'AND ' + data.diySearchLanguage?.trim()) : '' } `
            //     + `${data.httpStatus === 'success' ? 'AND LogInfo.Trace.HTTPStatusCode=*200*' : (data.httpStatus === 'error' ? 'AND LogInfo.Trace.HTTPStatusCode!=*200*' : '')} `;
            // } 
            // APAC
            // else {
                searchCommand += `index=int_gcg_*esb* AND sourcetype=SPRING_AUDIT_5 ${data.market ? 'AND countrycode=' + data.market.toUpperCase() : ''} `
                + `${channelId === 'MBOL' ? 'AND channelid=MBK ' : 'AND channelid=HBK '} `
                + `${data.uri ? 'AND uriTemplate=' + formatedUri : ''} `
                + `${data.cif ? 'AND additionalData.i-cif=' + data.cif : ''} `
                + `${data.diySearchLanguage?.trim() ? (data.diySearchLanguage?.trim().startsWith('AND') ? data.diySearchLanguage?.trim() : 'AND ' + data.diySearchLanguage?.trim()) : '' } `
                + `${data.httpStatus === 'success' ? '| where like(httpStatusCode, "2__%")' : (data.httpStatus === 'error' ? '| where NOT like(httpStatusCode, "2__%")' : '')} `
                + `| table _time uuid uriTemplate httpStatusCode method reqPayload metrics.payload sourcetype sid businesscode channelid | sort _time desc`;
            // }
        } 
        // GM
        else if (data.application === "GM") {     
            let paramKey = '';
            if(data.envRoot === "PAT" && this.isSpecificGMIndexValueMarket(data.market as string)) {
                paramKey = '_prod'
            }
            searchCommand += `index=int_gct_globalmobile_${data.market ? data.market.toLowerCase() + paramKey : ''}* `
            + `${data.uri ? 'AND REQ_URI=' + formatedUri : ''} `
            + `${data.moduleName ? 'AND FUNC_TYPE=' + data.moduleName : ''} `
            + `${data.screenName ? 'AND FUNC_SUB_TYPE=' + data.screenName : ''} `
            + `${data.username ? 'AND USER_NAME=*' + data.username + '*' : ''} `
            + `${data.market ? 'AND COUNTRY_CODE=' + data.market.toUpperCase() : ''} `
            + `${data.diySearchLanguage?.trim() ? (data.diySearchLanguage?.trim().startsWith('AND') ? data.diySearchLanguage?.trim() : 'AND ' + data.diySearchLanguage?.trim()) : '' } `
            + `${data.httpStatus === 'success' ? '| where like(STATUS_CODE, "2__%")' : (data.httpStatus === 'error' ? '| where NOT like(STATUS_CODE, "2__%")' : '')} `
            + `| table _time REQ_URI FUNC_TYPE FUNC_SUB_TYPE JFX_INSTANCE_ID APP_SERVER_INSTANCE_ID APP_SERVER_HOSTNAME CUSTOMER_ROLE COUNTRY_CODE | sort _time desc`;
        }
        // CBOL APP Server
        else if (data.application === "CBOL_APP") {  
            const paramKey = this.isEMEAMarket(data.market as string) ? 'int_gcg_emea_cbol_147634' : 'int_gcg_apac_cbol_147634';
            searchCommand += `index=${paramKey} `
            + `${data.uri ? 'AND REQ_URI=' + formatedUri : ''} `
            + `${data.moduleName && data.screenName ? 'AND OPERATION_NAME="' + data.moduleName + '|' + data.screenName + '*"' : ''} `
            + `${data.username ? 'AND USER_NAME=*' + data.username + '*' : ''} `
            + `${data.market ? 'AND BUSINESS_ID=' + data.market.toUpperCase() + '*' : ''} `
            + `${data.httpStatus === 'success' ? 'AND (OUT_COME=200* OR OUT_COME=SUCCESS*)' : (data.httpStatus === 'error' ? 'AND (OUT_COME!=200* AND OUT_COME!=SUCCESS*)' : '')} `
            + `${data.diySearchLanguage?.trim() ? (data.diySearchLanguage?.trim().startsWith('AND') ? data.diySearchLanguage?.trim() : 'AND ' + data.diySearchLanguage?.trim()) : '' } `
            + `| table _time REQ_URI HTTP_METHOD rest.odyssey.moduleName rest.odyssey.screenName UNIQUE_UID APP_SERVER_INSTANCE_ID JVM_ID BUSINESS_ID CHANNEL_ID | sort _time desc`;
        }
        return encodeURIComponent(searchCommand);
    }

    public getQuickSplunkSearchLink(data: SplunkSearchData, channelId: string): string | null {
        let splunkSearchLink: string = Templates.COMMON_BASE;
        try {
            //required fields - envRoot application
            if (!data.envRoot || !data.application) {
                return null;
            }
            if (data.envRoot && data.application) {
                splunkSearchLink = splunkSearchLink.replace('{{envRoot}}', this.config.splunk[channelId as keyof typeof this.config.splunk].envRoot[data.envRoot].uri[data.application]);
            }
            const encodeSearchCommand = this.buildSplunkSearchLanguage(data, channelId);
            splunkSearchLink = splunkSearchLink.replace('{{encode_search_command}}', encodeSearchCommand).replace('{{period_earliest}}', data.period as string);
        } catch (e) {
            console.error('splunk search link create fail', e);
        }
        return splunkSearchLink;
    }

    // get splunk otp search link
    public getOtpSplunkSearchLink(countryCode: string, mobileNo: string, envRoot: string, latestPeriod: string): string {
        let splunkSearchLink: string = Templates.COMMON_BASE;
        splunkSearchLink = splunkSearchLink.replace('{{envRoot}}', envRoot);
        let mobileMatchCommand1 = "";
        let mobileMatchCommand2 = "";
        if (mobileNo) {
            mobileMatchCommand1 = `(metrics.uri = "*/v1/communications/sms" AND metrics.payload="*${mobileNo}*") `;
            mobileMatchCommand2 = `(metrics.uri = "*/communicationHub/transactions/otp/delivery" metrics.payload="*smsText*" AND metrics.payload="*${mobileNo}*")`;
        } else {
            mobileMatchCommand1 = `(metrics.uri = "*/v1/communications/sms") `;
            mobileMatchCommand2 = `(metrics.uri = "*/communicationHub/transactions/otp/delivery" metrics.payload="*smsText*")`;
        }
        const mobileMatchCommand = `(${mobileMatchCommand1} OR ${mobileMatchCommand2})`;
        const encodeSearchCommand = `search index=* AND countrycode="${countryCode}" AND ${mobileMatchCommand} `
            + `| table _time countrycode metrics.uri metrics.payload | sort _time desc`;
        splunkSearchLink = splunkSearchLink.replace('{{encode_search_command}}', encodeURIComponent(encodeSearchCommand)).replace('{{period_earliest}}', latestPeriod);
        return splunkSearchLink;
    }
}

export class Templates {
    public static readonly COMMON_BASE: string = '{{envRoot}}?q={{encode_search_command}}'
        + '&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest={{period_earliest}}&latest=now';
}