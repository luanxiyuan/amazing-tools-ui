export enum MODULE_NAMES {
    UI_MARKER = 'ui-marker',
    GFT_TRANSLATION_TOOL = 'gft-translation-tool',
    ABBREVIATIONS = 'abbreviations',
    BB_CONTRIBUTION = 'bb-contribution',
};

export enum MODULE_TITLES {
    UI_MARKER = 'System X - UI',
    API_TREE = 'System X - API',
    CONTACTS = 'My Contacts',
    QUERY_CARD_INFO = 'Query Card Info',
    ONE_STEP = 'One Step',
    ABBREVIATION = 'Abbreviation',
    XSD_CONVERTER = 'XSD to Java',
    BASE64_CONVERTER = 'Base64 Converter',
    SWAGGER_VIEWER = 'Swagger Viewer',
    BB_CONTRIBUTION = 'Delivery Statistics Tool',
    JSON_TOOL = 'Json Tools',
    QUERY_OTP_TOOL = 'Query OTP Tool',
};

export enum SYS_SETTINGS {
    GLOBAL_CONFIG_FILE_PATH = './assets/configs/global-config.json',
    SPLUNK_CONFIG_FILE_PATH = './assets/configs/splunk-config.json',
};

export const ADMIN_SOEID = 'xl52284';
export const APPLICATIONS_BY_REGION = ['GFT', "GT"];
export const APPLICATIONS_BY_MARKET = ['CBOL', 'MBOL'];
export const APPLICATION_MARKETS = ['Common', 'SG', 'HK', 'UAE', 'PL'];
export const APPLICATION_REGIONS = ['Common', 'APAC', 'EMEA', 'NAM'];

export const API_CLASSIFICATIONS = ['Open', 'Private', 'Partner'];
export const API_STATUSES = ['Active', 'Deprecated', 'Retired'];
export const API_BELONGS_TO_APPLICATIONS = [
    {
        'name': 'App1',
        'channels': [
            'channel 1', 'channel 2', 'channel 3'
        ],
        'regions': ['Common', 'SG', 'HK', 'UAE', 'PL']
    },
    {
        'name': 'App2',
        'channels': [
            'channel 1', 'channel 2', 'channel 3'
        ],
        'regions': ['Common', 'APAC', 'EMEA', 'NAM']
    }
];
export const URI_SEARCH_MODES = ['Partial Match', 'Exact Match'];
export const JSON_SEARCH_MODES = ['Partial Match', 'Exact Match'];

export enum UI_MARKER_SETTINGS {
    CANVAS_WIDTH = 1000,
    CANVAS_WIDTH_MOBOLE_VIEW = 550,
    CANVAS_EDIT_PERMISSION = 1,     // 0 means not able to edit, 1 means able to edit
    EDIT_DRAWER_WIDTH = 1000,
    VIEW_DRAWER_WIDTH = 1000,
    APPLICATION_SCOPE_TYPE_REGION = 'REGION',
    APPLICATION_SCOPE_TYPE_MARKET = 'MARKET',
    SYNC_API_TREE_FLAG = 1,   // 1 means it'll be able to sync to API tree, 0 means no
    FAVICON_PATH = 'assets/favicons/uimarker-favicon.ico',
    PAGE_LIST_URI = '/ui-marker/page-list'
}

export enum API_TREE_SETTINGS {
    EDIT_DRAWER_WIDTH = 800,
    VIEW_DRAWER_WIDTH = 800,
    SUB_API_ADD_DRAWER_WIDTH = 1000,
    UI_API_RELATION_DRAWER_WIDTH = 1000,
    API_PAGE_SIZE = 10,
    BADGE_OVERFLOW_COUNT = 9999,
    FAVICON_PATH = 'assets/favicons/api-tree-favicon.ico',
    OPEN_PRIVATE_API_FILE_NAME = 'open-and-private-apis.xlsx'
}

export enum BB_CONTRIBUTION_SETTINGS {
    BADGE_OVERFLOW_COUNT = 999,
    FAVICON_PATH = 'assets/favicons/bb-contribution-favicon.ico',
    COMMIT_RECORDS_EXCEL_FILE_NAME = 'bb-commit-records.xlsx'
}

export enum JSON_TOOL_SETTINGS {
    BADGE_OVERFLOW_COUNT = 999,
    FAVICON_PATH = 'assets/favicons/json-tool-favicon.ico'
}

export const IMAGE_UPLOAD_NOTES = [
    '1. Please upload screenshot images in jpeg/png format, the maximum file size is 5MB.',
    '2. Please only upload your function screenshot, don\'t upload any images that violate compliance regulations.'
]

export const XSD_UPLOAD_NOTES = [
    '1. Please upload file in .xsd format, the maximum file size is 5MB.',
    '2. Please only upload valid XSD file, don\'t upload any images that violate compliance regulations.'
]

export const BASE64_FILE_UPLOAD_NOTES = [
    '1. Upload a file with maximum size 5MB, supports pdf, png, jpg, jpeg files.',
    '2. Only upload valid file, no scripts containing attacks or viruses.'
]

export enum CONTACTS_SETTINGS {
    EDIT_DRAWER_WIDTH = 600,
    VIEW_DRAWER_WIDTH = 600,
    TEAM_MEMBER_DRAWER_WIDTH = 1200,
    BADGE_OVERFLOW_COUNT = 999,
    PERSON_EXCEL_FILE_NAME = 'person_list.xlsx',
    PERSON_PAGE_SIZE = 20,
    TEAM_PAGE_SIZE = 20,
    FAVICON_PATH = 'assets/favicons/contacts-favicon.ico',
    COMMING_BIRTHDAY_DAYS = 3
}

export enum ABBREVIATION_SETTINGS {
    EDIT_DRAWER_WIDTH = 600,
    FAVICON_PATH = 'assets/favicons/abbreviation-favicon.ico',
    SEARCH_LINK = 'search?searchText={0}'
}

export enum ONE_STEP_SETTINGS {
    FAVICON_PATH = 'assets/favicons/one-step-favicon.ico',
    EXECUTE_LOG_FETCH_INTERVAL_MS = 3000,
    RELOAD_AFTER_STEP_MS = 3000
}

export enum XSD_CONVERTER_SETTINGS {
    JAVA_ZIP_FILE_NAME = 'java_files.zip',
    FAVICON_PATH = 'assets/favicons/xsd-converter-favicon.ico'
}

export enum BASE64_CONVERTER_SETTINGS {
    FAVICON_PATH = 'assets/favicons/base64-converter-favicon.ico',
    FILE_NAME_PREFIX = 'base64-converter',
    MAX_FILE_SIZE_MB = 5
}

export enum SWAGGER_VIEWER_SETTINGS {
    FAVICON_PATH = 'assets/favicons/swagger-viewer-favicon.ico',
    VSCODE_PLUGIN_FILE_NAME = 'swagger-viewer-0.0.1.vsix'
}

export const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export const API_BASE_URL = "http://localhost:5000";

export enum UI_MARKER_URIS {
    GET_APPLICATIONS = API_BASE_URL + '/ui_marker/applications',
    UPLOAD_IMAGE = API_BASE_URL + '/ui_marker/upload_image',
    REPLACE_IMAGE = API_BASE_URL + '/ui_marker/replace_image',
    GET_PAGES = API_BASE_URL + '/ui_marker/pages',
    REMOVE_PAGE = API_BASE_URL + '/ui_marker/page',
    CANVAS_MARKER_DETAILS = API_BASE_URL + '/ui_marker/canvas_marker_details',
    MARKER_FORM_DETAILS = API_BASE_URL + '/ui_marker/marker_form_details',
    PAGE_FORM_DETAILS = API_BASE_URL + '/ui_marker/page_form_details',
    UI_API_RELATION = API_BASE_URL + '/ui_marker/ui_api_relation'
};

export enum API_TREE_URIS {
    GET_OPEN_APIS = API_BASE_URL + '/api_tree/open_apis',
    ADD_OPEN_APIS = API_BASE_URL + '/api_tree/open_apis',
    ADD_API = API_BASE_URL + '/api_tree/api',
    DELETE_API = API_BASE_URL + '/api_tree/api',
    UPDATE_API = API_BASE_URL + '/api_tree/api',
    GET_APIS = API_BASE_URL + '/api_tree/apis',
    DOWNLOAD_APIS_EXCEL = API_BASE_URL + '/api_tree/apis/excel',
    UPDATE_SUB_API_IDS = API_BASE_URL + '/api_tree/sub_api_ids',
    DELETE_SUB_API = API_BASE_URL + '/api_tree/sub_api'
};

export enum CONTACTS_URIS {
    LOCATIONS = API_BASE_URL + '/contacts/locations',
    PERSONS = API_BASE_URL + '/contacts/persons',
    TEAMS = API_BASE_URL + '/contacts/teams',
    PERSONS_EXCEL = API_BASE_URL + '/contacts/persons/excel',
}

export enum ABBREVIATION_URIS {
    ABBREVIATIONS = API_BASE_URL + '/abbreviations',
}

export enum XSD_CONVERTER_URIS {
    XSD_UPLOAD_CONVERT = API_BASE_URL + '/convert_xsd_to_java',
    XSD_DOWNLOAD_JAVA_FILE = API_BASE_URL + '/download_xsd_java_file'
}

export enum SWAGGER_VIEWER_URIS {
    VSCODE_PLUGIN = API_BASE_URL + '/swagger_viewer/vscode_plugin'
}

export enum ONE_STEP_URIS {
    GET_COMMAND_SETS = API_BASE_URL + '/one_step/command_sets',
    EXECUTE_COMMAND_SET = API_BASE_URL + '/one_step/execute_command_set',
    STOP_PROCESS = API_BASE_URL + '/one_step/stop_process',
    VIEW_EXECUTION_LOG = API_BASE_URL + '/one_step/view_execution_log'
}

export enum COMMON_URIS {
    BACKEND_OS_TYPE = API_BASE_URL + '/common/os_type',
}

export enum BB_CONTRIBUTION_URIS {
    GET_COMMIT_LIST = API_BASE_URL + '/bb_contribution/commit_list',
    DOWNLOAD_COMMIT_EXCEL = API_BASE_URL + '/bb_contribution/commit_list/excel',
    REFRESH_COMMIT_LIST = API_BASE_URL + '/bb_contribution/commit_list/refresh',
    GET_REFRESH_INFO = API_BASE_URL + '/bb_contribution/commit_list/refresh_info',
    GET_REPO_LINKS = API_BASE_URL + '/bb_contribution/repo_links'
}

export enum ELEMENT_FORM_PREFIX {
    CTA_ID = 'ctaId-',
    CTA_CONTROL_INSTANCE = 'ctaControlInstance-',
    URI_ID = 'uriId-',
    URI_CONTROL_INSTANCE = 'uriControlInstance-',
    METHOD_ID = 'methodId-',
    METHOD_CONTROL_INSTANCE = 'methodControlInstance-',
    CONDITION_ID = 'conditionId-',
    CONDITION_CONTROL_INSTANCE = 'conditionControlInstance-',
    SAMPLE_REQ_ID = 'sampleReqId-',
    SAMPLE_REQ_CONTROL_INSTANCE = 'sampleReqControlInstance-',
    SAMPLE_RES_ID = 'sampleResId-',
    SAMPLE_RES_CONTROL_INSTANCE = 'sampleResControlInstance-',
    COMMENTS_ID = 'commentsId-',
    COMMENTS_CONTROL_INSTANCE = 'commentsControlInstance-'
}

export enum PAGE_FORM_PREFIX {
    CTA_ID = 'pageCtaId-',
    CTA_CONTROL_INSTANCE = 'pageCtaControlInstance-',
    URI_ID = 'pageUriId-',
    URI_CONTROL_INSTANCE = 'pageUriControlInstance-',
    METHOD_ID = 'pageMethodId-',
    METHOD_CONTROL_INSTANCE = 'pageMethodControlInstance-',
    CONDITION_ID = 'pageConditionId-',
    CONDITION_CONTROL_INSTANCE = 'pageConditionControlInstance-',
    SAMPLE_REQ_ID = 'pageSampleReqId-',
    SAMPLE_REQ_CONTROL_INSTANCE = 'pageSampleReqControlInstance-',
    SAMPLE_RES_ID = 'pageSampleResId-',
    SAMPLE_RES_CONTROL_INSTANCE = 'pageSampleResControlInstance-',
    COMMENTS_ID = 'pageCommentsId-',
    COMMENTS_CONTROL_INSTANCE = 'pageCommentsControlInstance-'
}

export const ELEMENT_CTA_TYPES = [
    'Loading', 'Clicked', 'Option Selected', 'Focus Out', 'Swiped', 'Checked'
]

export const HTTP_METHODS = [
    'GET', 'POST', 'PUT', 'DELETE'
]

export const PAGE_CTA_TYPES = [
    'Loading', 'Pre Loading', 'CTA', 'Dropoff'
]

export const PAGE_VIEW_TYPES = [
    'Web', 'Mobile'
]

export const MARKER_TYPES = [
    'Page', 'Element'
]

export const IMAGE_FAILBACK = 'data:image/png;base64,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';

export const ERROR_CODE_MAP = {
    ['429']: 'Too many requests in a short period of time, please try later'
}

export const API_RESP_MESSAGE = {
    SERVER_SIDE_ISSUE: 'There\'s server side issue happens, please try again later'
}

export enum CUSTOM_ICONS {
    SPLUNK = '<svg version="1.0" xmlns="http://www.w3.org/2000/svg"  width="720.000000pt" height="720.000000pt" viewBox="0 0 720.000000 720.000000"  preserveAspectRatio="xMidYMid meet">  <g transform="translate(0.000000,720.000000) scale(0.100000,-0.100000)" fill="#000000" stroke="none"> <path d="M3530 7110 c-180 -3 -274 -9 -293 -17 -16 -8 -71 -13 -130 -13 -70 -1 -110 -5 -127 -15 -14 -8 -44 -14 -67 -15 -23 0 -54 -5 -70 -11 -15 -7 -48 -15 -73 -20 -110 -19 -216 -52 -315 -99 -96 -46 -196 -80 -231 -80 -26 0 -104 -40 -124 -65 -7 -8 -27 -17 -46 -21 -19 -3 -69 -26 -112 -50 -42 -23 -104 -57 -137 -74 -112 -59 -207 -125 -285 -197 -43 -40 -84 -73 -90 -73 -6 0 -29 -17 -53 -38 -23 -21 -58 -48 -77 -60 -52 -31 -433 -420 -460 -469 -13 -24 -27 -43 -32 -43 -4 0 -15 -15 -24 -32 -9 -18 -40 -58 -69 -88 -29 -31 -56 -67 -60 -80 -4 -14 -18 -38 -31 -53 -13 -16 -24 -36 -24 -45 0 -8 -17 -41 -37 -71 -20 -31 -44 -67 -53 -81 -27 -41 -90 -169 -90 -183 0 -8 -31 -75 -69 -151 -63 -125 -93 -202 -119 -311 -5 -22 -26 -93 -46 -157 -20 -64 -36 -129 -36 -145 0 -15 -14 -66 -30 -113 -22 -62 -30 -103 -30 -155 -1 -42 -6 -80 -15 -95 -22 -38 -22 -772 0 -823 10 -24 15 -69 15 -130 0 -51 4 -97 9 -102 12 -14 51 -135 51 -159 0 -22 23 -99 46 -154 8 -18 14 -43 14 -55 0 -12 20 -78 44 -147 67 -191 90 -247 108 -267 9 -10 20 -31 24 -48 11 -46 128 -272 178 -345 24 -36 66 -105 92 -155 27 -49 69 -112 93 -138 25 -27 55 -65 67 -84 28 -47 551 -570 589 -590 17 -9 49 -32 72 -52 65 -56 94 -76 153 -106 30 -15 75 -45 100 -66 45 -38 378 -212 478 -249 29 -11 70 -29 90 -39 20 -10 53 -22 72 -26 19 -4 50 -18 68 -32 20 -15 50 -26 79 -29 26 -2 72 -13 102 -25 58 -21 153 -45 238 -59 29 -4 62 -15 75 -24 16 -12 46 -16 114 -16 58 0 104 -5 127 -15 50 -21 795 -20 846 1 18 8 66 14 108 14 44 0 85 6 101 14 15 8 50 19 77 24 172 34 505 143 623 203 41 22 81 39 89 39 20 0 253 118 278 141 11 10 38 25 60 33 42 15 176 99 260 163 27 21 68 48 90 61 22 13 65 45 95 71 30 26 66 54 80 61 48 24 361 352 381 399 11 24 60 87 112 141 67 71 103 118 132 176 21 44 48 91 60 105 41 53 161 260 186 321 10 27 32 75 49 108 16 33 30 65 30 72 0 7 20 55 45 106 25 51 45 105 45 120 0 15 12 59 26 97 55 155 64 186 64 228 0 24 4 47 9 52 19 20 44 134 50 230 3 55 12 110 18 122 10 16 13 122 13 418 1 338 -1 401 -15 427 -9 20 -15 59 -15 107 -1 47 -6 86 -15 101 -8 14 -14 47 -15 73 0 26 -7 64 -15 84 -8 19 -15 47 -15 62 0 14 -14 55 -30 89 -17 35 -30 79 -30 98 0 44 -31 137 -80 239 -20 44 -46 103 -55 130 -10 28 -29 63 -42 78 -12 16 -26 41 -30 55 -9 40 -44 109 -84 172 -19 30 -45 75 -58 100 -13 25 -37 61 -55 81 -31 36 -38 47 -111 171 -22 37 -63 91 -91 120 -28 29 -62 71 -76 93 -31 49 -339 358 -389 390 -19 13 -70 56 -113 96 -43 41 -99 85 -125 98 -25 12 -68 44 -96 71 -40 37 -110 77 -335 190 -255 128 -436 210 -465 210 -5 0 -32 11 -60 25 -27 13 -60 25 -73 25 -23 0 -189 51 -250 76 -18 8 -56 14 -85 14 -29 1 -63 7 -77 15 -18 10 -61 14 -153 15 -71 0 -137 5 -148 10 -38 21 -110 25 -369 20z m-761 -2784 c8 -9 10 -172 9 -587 l-3 -574 -99 -3 c-60 -2 -103 1 -110 8 -15 15 -9 1139 6 1157 15 19 181 18 197 -1z m2132 -8 c5 -7 9 -156 9 -330 0 -174 4 -319 9 -322 4 -3 23 16 42 42 18 26 63 79 99 118 36 38 81 90 100 114 l36 44 59 -24 c114 -46 113 -57 -30 -205 -58 -61 -108 -120 -111 -133 -7 -24 0 -34 72 -122 24 -30 64 -80 87 -111 24 -31 60 -76 80 -101 57 -69 51 -81 -58 -120 -93 -34 -93 -33 -234 172 -119 173 -138 199 -145 193 -3 -4 -6 -83 -6 -177 0 -94 -4 -176 -8 -183 -11 -17 -198 -21 -215 -4 -9 9 -12 142 -11 582 0 485 2 572 15 580 22 14 200 4 210 -13z m-3437 -358 c75 -28 82 -39 57 -87 -30 -61 -46 -70 -84 -51 -18 9 -54 19 -80 22 -64 8 -97 -13 -97 -60 0 -38 24 -65 167 -185 61 -52 97 -91 112 -121 54 -112 5 -245 -113 -305 -42 -22 -68 -28 -147 -31 -108 -5 -149 4 -221 50 -54 34 -58 49 -27 108 23 44 49 52 81 23 68 -61 207 -54 224 12 14 56 -7 88 -120 175 -128 99 -178 168 -178 244 0 88 55 166 146 207 59 27 206 26 280 -1z m811 -11 c92 -43 144 -111 189 -244 49 -149 -9 -365 -126 -466 -84 -73 -129 -92 -229 -97 -96 -5 -138 8 -189 59 -16 16 -33 29 -39 29 -7 0 -11 -48 -12 -142 -1 -150 -11 -313 -19 -321 -3 -2 -42 -7 -87 -11 -67 -5 -84 -4 -97 10 -14 14 -16 78 -16 591 0 369 4 582 11 594 8 16 21 19 91 19 90 0 118 -14 118 -57 0 -25 24 -32 37 -10 11 18 63 52 98 65 17 6 69 11 117 11 78 1 95 -2 153 -30z m825 21 c12 -8 16 -55 22 -277 3 -147 9 -283 13 -300 4 -19 22 -46 41 -63 66 -58 186 -34 241 49 15 23 18 58 21 296 5 324 -1 309 114 303 52 -2 82 -8 92 -18 20 -21 27 -773 8 -792 -13 -13 -184 -14 -203 -2 -5 3 -9 16 -9 29 0 38 -15 38 -72 2 -72 -46 -109 -57 -187 -57 -119 1 -174 26 -228 106 -48 69 -52 101 -54 412 -1 164 2 297 7 302 5 5 41 11 79 13 39 1 77 4 85 5 8 1 22 -3 30 -8z m1301 -9 c61 -27 106 -77 129 -144 18 -51 20 -82 20 -344 0 -164 -4 -294 -10 -303 -13 -20 -169 -21 -193 -1 -15 12 -17 43 -17 258 0 309 -9 351 -84 390 -36 19 -119 10 -164 -17 -63 -39 -66 -56 -72 -360 l-5 -275 -37 -9 c-22 -6 -64 -6 -105 0 l-68 9 -3 389 c-1 279 1 393 9 402 8 10 37 14 98 14 92 0 111 -8 111 -45 0 -34 10 -36 44 -10 65 49 115 65 212 65 69 0 102 -5 135 -19z m1244 -41 c9 -15 125 -76 170 -90 22 -7 60 -27 85 -45 25 -18 88 -52 140 -76 172 -78 179 -85 161 -161 -5 -23 -68 -78 -89 -78 -4 0 -33 -18 -66 -40 -32 -22 -64 -40 -70 -40 -10 0 -57 -24 -195 -97 -33 -18 -67 -33 -75 -33 -9 0 -30 -9 -48 -20 -43 -26 -55 -25 -60 4 -7 36 16 83 49 100 16 8 35 22 42 30 8 9 19 16 26 16 15 0 176 76 260 123 72 40 80 62 32 95 -18 12 -39 22 -45 22 -18 0 -346 170 -354 183 -10 15 -10 101 -1 110 10 10 31 8 38 -3z"/> <path d="M1992 3835 c-62 -33 -105 -95 -121 -175 -15 -68 2 -227 30 -281 53 -107 183 -132 262 -51 53 55 70 109 74 237 4 108 3 111 -29 175 -21 42 -44 71 -63 81 -40 22 -124 30 -153 14z"/> </g> </svg>'
}