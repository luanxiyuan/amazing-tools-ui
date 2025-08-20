export interface ApiConfigSchema {
    name: string;
    uri: string;
}

export interface Application {
    id: string;
    name: string;
    modules?: Module[];
}

export interface Module {
    id: string;
    name: string;
    functions?: Function[];
}

export interface Function {
    id: string;
    name: string;
}

export interface ToolApps {
    id: string;
    name: string;
    desc: string;
    uri: string;
    eligible: boolean;
}

export interface AppCategory {
    name?: string;
    nzIcon?: string;
    uri?: string;
    apps?: ToolApps[];
}