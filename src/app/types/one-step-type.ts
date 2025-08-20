/* define an interface named "CommandSet" with below format
{
    "id": "246427eb1-2805-4202-9df3-516f1838f038",
    "name": "start web-borrow MBOL",
    "ports":  ["4011"],
    "osType": "MacOS",
    "commands": [
      "cd /Users/xl52284/Documents/Odyssey/167407-web-borrow",
      "npm run start"
    ]
  }
*/
export interface CommandSet {
    id: string;
    name: string;
    ports?: number[];
    portStatus?: PortInUseStatus[];
    osType: string;
    commands: string[];
    commandFile?: string;
}

interface PortInUseStatus {
  port: string;
  isInUseFlag: boolean;
}

export interface OSType {
  osType: string;
}