export interface UIMarkerRect extends fabric.Rect {
    id?: string;
}

export interface ElementFormAPIControlEntity {
    id: number;
    ctaId: string; 
    ctaControlInstance: string; 
    uriId: string; 
    uriControlInstance: string;
    methodId: string; 
    methodControlInstance: string;
    conditionId: string; 
    conditionControlInstance: string;
    sampleReqId: string;
    sampleReqControlInstance: string;
    sampleResId: string;
    sampleResControlInstance: string;
    commentsId: string;
    commentsControlInstance: string;
}

export interface PageFormAPIControlEntity {
    id: number;
    ctaId: string; 
    ctaControlInstance: string; 
    uriId: string; 
    uriControlInstance: string;
    methodId: string; 
    methodControlInstance: string;
    conditionId: string; 
    conditionControlInstance: string;
    sampleReqId: string;
    sampleReqControlInstance: string;
    sampleResId: string;
    sampleResControlInstance: string;
    commentsId: string;
    commentsControlInstance: string;
}

export interface ApiFormDetails {
    ctaValue: string;
    uriValue: string;
    methodValue: string;
    conditionValue: string;
    sampleReqValue: string;
    sampleResValue: string;
    commentsValue: string;
}

export interface MarkerFormDetails {
    apiFormDetails?: ApiFormDetails[];
    apiNumber?: number;
    otherSuppTextArea?: string
}


export interface PageFormDetails {
    pageDesc?: string;
    pageViewType?: string;
    scopeValue?: string;
    apiFormDetails?: ApiFormDetails[];
    apiNumber?: number;
    otherSuppTextArea?: string;
}

export interface PageListingEntity {
    imageFileUri: string;
    pageDesc?: string;
    pageViewType?: string;
    scopeValue?: string;
}

export interface CanvasMarkerPopup {
    visible: boolean;
    left: number;
    top: number;
}

export interface UiApiRelation {
    markerType: string;
    appId: string;
    appName: string;
    moduleId: string;
    moduleName: string;
    funId: string;
    funName: string;
    pageId: string;
    pageDesc: string;
    pageUri: string;
    pageViewType: string;
    rectId?: string;
    uri: string;
    httpMethod: string;
    scenario: string;
}