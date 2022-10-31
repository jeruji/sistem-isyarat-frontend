import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Translate from "./Translate";
import { useRecoilState } from "recoil";
import { userState } from "../store/state";
import { WebsocketService } from "../services/websocket-service";

const Home = () => {
  const [user, _] = useRecoilState(userState);
  const webSocketService = WebsocketService.getInstance();
  const webSocketGreetingsSubscribeEndpoint = "/user/topic/greetings";
  const webSocketGreetingsSendEndpoint = "/app/hello";
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    webSocketService.connect(
      () => {
        webSocketService &&
          webSocketService.subscribe(
            webSocketGreetingsSubscribeEndpoint,
            (message) => {
              if (message.body) {
                console.log("Received WS message: ", message.body);
                setMessage(message.body);
              } else {
                console.warn("Received empty message", message);
              }
            }
          );
        sendMessage();
      },
      () => {},
      () => {}
    );
  }, []);

  const sendMessage = (): void => {
    webSocketService &&
      webSocketService.sendMessage(
        webSocketGreetingsSendEndpoint,
        JSON.stringify({ name: user.name })
      );
  };

  return (
    <>
      <TopBar />
      <div className="row pb-4">&nbsp;</div>
      <div className="row">
        <div className="col-lg-5">
          <span>{message}</span>
        </div>
      </div>
    </>
  );
};

export default Home;
