import { MqttClient } from "mqtt";
import { Controller, Router, IMiddleware } from "egg";

declare module "egg" {
  class EMQXClient extends MqttClient {
    route: (topic: string, ...middleware: IMiddleware[]) => Router;
  }

  interface EMQXSingleton {
    clients: Map<string, EMQXClient>;
    get(id: string): EMQXClient;
  }

  interface EMQXConfig {
    name: string;
    host: string;
    password: string;
    username: string;
    clientId: string;
    options?: {
      keepalive?: number = 60;
      protocolId?: "MQTT" = "MQTT";
      protocolVersion?: 4 = 4;
      clean?: boolean = true;
      reconnectPeriod?: number = 1000;
      connectTimeout?: number = 30 * 1000;
      rejectUnauthorized?: boolean = false;
    };
    msgMiddleware?: string[];
  }

  // TODO
  interface Application {
    emqx: Map<string, EMQXClient> & EMQXClient;
    mqtt: any;
  }

  interface Context {
    req: IncomingMessage & {
      msg: string;
      socket: { remoteAddress: string };
      method: string;
      userId: string;
      url: string;
    };
  }

  interface EggAppConfig {
    emqx: {
      client?: EMQXConfig;
      clients?: {
        [key: string]: EMQXConfig;
      };
    };
  }
}
