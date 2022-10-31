import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import { WebsocketService } from "../services/websocket-service";
import { useRecoilState } from "recoil";
import { userState } from "../store/state";

const Admin = () => {
  type UserType = {
    username: string;
    principalId: string;
    sessionId: string;
  };

  const webSocketService = WebsocketService.getInstance();
  const webSocketGreetingsSubscribeEndpoint = "/user/topic/register";
  const webSocketGreetingsSendEndpoint = "/app/hello";
  const webSocketChatSubscribeEndpoint = "/user/topic/chat";
  const webSocketChatEndpoint = "/app/chat";
  const webSocketUserEndpoint = "/app/users";
  const [sentence, setSentence] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [users, setUsers] = useState<UserType[]>([]);
  const [user, setUser] = useRecoilState(userState);
  const [loading, setLoading] = useState<boolean>(true);
  const [socketConnect, setSocketConnect] = useState<boolean>(
    webSocketService.isConnected
  );

  useEffect(() => {
    setLoading(false);
  }, [user]);

  const startConnect = () => {
    setLoading(true);
    webSocketService.connect(
      () => {
        webSocketService &&
          webSocketService.subscribe(
            webSocketGreetingsSubscribeEndpoint,
            (message) => {
              if (message.body) {
                console.log("Received WS message: ", JSON.parse(message.body));
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
        sendMessage();
        getUsers();
        subscribeChat();
      },
      () => {},
      () => {}
    );
  };

  const sendMessage = (): void => {
    webSocketService &&
      webSocketService.sendMessage(
        webSocketGreetingsSendEndpoint,
        JSON.stringify({ name: "admin" })
      );
  };

  const sendSigns = (): void => {
    webSocketService &&
      webSocketService.sendMessage(
        webSocketChatEndpoint,
        JSON.stringify({ destination: "", message: sentence })
      );
  };

  const subscribeChat = (): void => {
    webSocketService.subscribe(
      webSocketChatSubscribeEndpoint,
      (message)=> {
        if(message.body){
          console.log("chat subscribe", message.body);
        }
      }
    )
  }

  const getUsers = (): void => {
    console.log("get users");
    webSocketService &&
      webSocketService.sendMessage(
        webSocketUserEndpoint,
        JSON.stringify({ name: "admin" })
      );
    setLoading(false);
  };

  return (
    !loading && (
      <>
        <TopBar />
        <div className="container-fluid position-relative pb-2 pt-2">
          <div className="row pt-5">
            <div className="col-1">&nbsp;</div>
            <div className="col-8">
              <h2>Selamat Datang Admin</h2>
            </div>
          </div>
          {!socketConnect && (
            <div className="row pt-5">
              <div className="col-1">&nbsp;</div>
              <div className="col-8">Click tombol untuk memulai</div>
              <div className="col-2">
                <button onClick={() => startConnect()} className="w-100">
                  <span>Mulai</span>
                </button>
              </div>
              <div className="col-1">&nbsp;</div>
            </div>
          )}
          {socketConnect && (
            <>
              <div className="row pt-5">
                <div className="col-1">&nbsp;</div>
                <div className="col-8">
                  <textarea
                    readOnly
                    className="w-100"
                    style={{
                      minHeight: "200px",
                      overflowX: "hidden",
                      overflowY: "scroll",
                    }}
                  />
                </div>
                <div
                  className="col-2 bg-light"
                  style={{
                    overflowX: "hidden",
                    overflowY: "scroll",
                    minHeight: "200px",
                  }}
                >
                  {users.map((aUser) => {
                    return (
                      aUser.sessionId !== user.sessionId && (
                        <span
                          className="d-block"
                          key={`user_${aUser.principalId}`}
                        >{`${aUser.username}`}</span>
                      )
                    );
                  })}
                </div>
                <div className="col-1">&nbsp;</div>
              </div>
              <div className="row pt-4">
                <div className="col-1">&nbsp;</div>
                <div className="col-7">
                  <input
                    type="text"
                    name="sentence"
                    id="sentence"
                    placeholder="Type Text to Translate"
                    className="w-100"
                    onChange={(event) => setSentence(event.target.value)}
                  />
                </div>
                <div className="col-1">
                  <button onClick={() => sendSigns()} className="w-100">
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    )
  );
};

export default Admin;
