import React, { FunctionComponent, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useRecoilState } from "recoil";
import retrieve from "../services/retrieve";
import { WebsocketService } from "../services/websocket-service";
import { userState } from "../store/state";

interface IProps {
  username: string
}

const Translate: FunctionComponent<IProps> = ({username}) => {
  type ListVideoType = {
    id: string;
    name: string;
    file: string;
  };

  type UserType = {
    username: string;
    principalId: string;
    sessionId: string;
  };
  const [user, setUser] = useRecoilState(userState);
  const [videos, setVideos] = useState<ListVideoType[]>();
  const [users, setUsers] = useState<UserType>();
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [sentence, setSentence] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [index, setIndex] = useState<number>(0);
  const webSocketService = WebsocketService.getInstance();
  const [socketConnect, setSocketConnect] = useState<boolean>(
    webSocketService.isConnected
  );
  const webSocketGreetingsSubscribeEndpoint = "/user/topic/register";
  const webSocketGreetingsSendEndpoint = "/app/hello";
  const webSocketChatSubscribeEndpoint = "/user/topic/chat";
  const webSocketChatEndpoint = "/app/chat";

  useEffect(()=>{
    if (!socketConnect) {
      console.log("translate connected?",webSocketService.isConnected);
      webSocketService.connect(
        () => {
          webSocketService &&
            webSocketService.subscribe(
              webSocketGreetingsSubscribeEndpoint,
              (message) => {
                if (message.body) {
                  console.log(
                    "Received WS message: ",
                    JSON.parse(message.body)
                  );
                  let jsonMessageBody = JSON.parse(message.body);
                  if (
                    typeof jsonMessageBody.content === "undefined" &&
                    typeof jsonMessageBody.username === "undefined"
                  ) {
                    setUsers(jsonMessageBody);
                  } else if (
                    typeof jsonMessageBody.username !== "undefined" &&
                    typeof jsonMessageBody.principalId !== "undefined"
                  ) {
                    console.log("jsonMessageBody user", jsonMessageBody);
                    setUser({
                      id: jsonMessageBody.principalId,
                      name: jsonMessageBody.username,
                      sessionId: jsonMessageBody.sessionId,
                    });
                  } else if (
                    typeof jsonMessageBody.content !== "undefined" &&
                    typeof jsonMessageBody.username === "undefined"
                  ) {
                    setMessage(message.body);
                  }
                } else {
                  console.warn("Received empty message", message);
                }
              }
            );
          setSocketConnect(webSocketService.isConnected);
          sendUsername();
          subscribeChat();
        },
        () => {},
        () => {}
      );
    }
    return (()=>setSocketConnect(webSocketService.isConnected))
  },[socketConnect,sentence])

  const getSigns = () => {
    retrieve.retrieveListVideo(sentence).then((response: ListVideoType[]) => {
      setVideos(response);
      setCurrentVideo(response[0].name);
      setIndex(0);
    });
  };

  const setNextVideo = () => {
    if (index + 1 < videos.length) {
      setIndex(index + 1);
      setCurrentVideo(videos[index + 1].name);
    }
    else{
      setCurrentVideo("")
    }
  };

  const sendUsername = (): void => {
    webSocketService &&
      webSocketService.sendMessage(
        webSocketGreetingsSendEndpoint,
        JSON.stringify({ name: username })
      );
  };

  const sendMessage = ():void => {
    console.log('is connected', webSocketService.isConnected)
    webSocketService &&
      webSocketService.sendMessage(
        webSocketChatEndpoint,
        JSON.stringify({ destination: "admin", message: sentence })
      );
  }

  const subscribeChat = (): void => {
    webSocketService.subscribe(webSocketChatSubscribeEndpoint, (message) => {
      console.log("message subscribechat", message)
      if (message.body) {
        console.log("chat subscribe", message.body);
      }
    });
  };

  return (
    <div className="container-fluid position-relative pb-2 pt-2gbb">
      <div className="row">
        <div className="col-1">&nbsp;</div>
        <div className="col-10">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-12 bg-light">
                  {currentVideo !== "" && (
                    <ReactPlayer
                      url={`http://localhost:8080/sibi/video/${currentVideo}`}
                      controls={true}
                      playing={true}
                      onEnded={() => {
                        setNextVideo();
                      }}
                      style={{ marginLeft: "auto", marginRight: "auto" }}
                    />
                  )}
                </div>
              </div>
              <div className="row pt-5 pb-5">
                <div className="col-10">
                  <input
                    type="text"
                    name="sentence"
                    id="sentence"
                    placeholder="Type Text to Translate"
                    className="w-100"
                    onChange={(event) => setSentence(event.target.value)}
                  />
                </div>
                <div className="col-2">
                  <button onClick={() => sendMessage()}>
                    <span>Kirim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-1">&nbsp;</div>
      </div>
    </div>
  );
};

export default Translate;
