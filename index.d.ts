import { MqttClient } from "mqtt";
import { Controller, IMiddleware } from "egg";
import Router from "koa-router";

declare module "egg" {
  class EMQXClient extends MqttClient {
    route<StateT = any, CustomT = {}>(
      path: string,
      ...middleware: Array<Router.IMiddleware<StateT, CustomT>>
    ): Router<StateT, CustomT>;
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
