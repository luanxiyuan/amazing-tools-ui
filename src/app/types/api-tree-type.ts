export interface OpenAndPrivateApi {
    id: string;
    swaggerTitle: string;
    serviceName: string;
    bianBehaviorQualifier: string;
    subQualifier: string;
    channel: string;
    regionOrCountry: string;
    apiName: string;
    httpMethod: string;
    uri: string;
    classification: string;
    bianAdoptionLevel: string;
    apiStatus: string;
    belongsToApplication: string;
    subIds: string[];
    remark: string;
    createTime: string;
}

export interface OpenAndPrivateApiUIObj extends OpenAndPrivateApi {
    expendFlag: boolean;
    subApis?: OpenAndPrivateApi[];
}

export class OpenAndPrivateApiEntity implements OpenAndPrivateApi {
    id: string;
    swaggerTitle: string;
    serviceName: string;
    bianBehaviorQualifier: string;
    subQualifier: string;
    channel: string;
    regionOrCountry: string;
    apiName: string;
    httpMethod: string;
    uri: string;
    classification: string;
    bianAdoptionLevel: string;
    apiStatus: string;
    belongsToApplication: string;
    subIds: string[];
    remark: string;
    createTime: string;

    constructor(
        id?: string,
        swaggerTitle?: string,
        serviceName?: string,
        bianBehaviorQualifier?: string,
        subQualifier?: string,
        channel?: string,
        regionOrCountry?: string,
        apiName?: string,
        httpMethod?: string,
        uri?: string,
        classification?: string,
        bianAdoptionLevel?: string,
        apiStatus?: string,
        belongsToApplication?: string,
        subIds?: string[],
        remark?: string,
        createTime?: string
    ) {
        this.id = id || '';
        this.swaggerTitle = swaggerTitle || '';
        this.serviceName = serviceName || '';
        this.bianBehaviorQualifier = bianBehaviorQualifier || '';
        this.subQualifier = subQualifier || '';
        this.channel = channel || '';
        this.regionOrCountry = regionOrCountry || '';
        this.apiName = apiName || '';
        this.httpMethod = httpMethod || '';
        this.uri = uri || '';
        this.classification = classification || '';
        this.bianAdoptionLevel = bianAdoptionLevel || '';
        this.apiStatus = apiStatus || '';
        this.belongsToApplication = belongsToApplication || '';
        this.subIds = subIds || [];
        this.remark = remark || '';
        this.createTime = createTime || '';
    }
}

export interface BelongsToApplication {
    name: string;
    channels: string[];
    regions: string[];
}