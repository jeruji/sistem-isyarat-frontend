import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import TopBar from "./TopBar";
import { Client, Frame, over } from "stompjs";
import SockJS from "sockjs-client";

var stompClient: Client = null;
const Admin = () => {
  const [userData, setUserData] = useState({
    username: "admin",
    receivername: "",
    connected: false,
    message: "",
  });
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("CHATROOM");
  const serverURL = process.env.REACT_APP_SERVER_URL;

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const connect = () => {
    setLoading(true);
    let Sock = new SockJS(serverURL);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setLoading(false);
    setUserData({ ...userData, connected: true });
    stompClient.subscribe("/chatroom/public", onMessageReceived);
    stompClient.subscribe(
      "/user/" + userData.username + "/private",
      onPrivateMessage
    );
    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const userLeft = () => {
    let chatMessage = {
      senderName: userData.username,
      status: "LEAVE",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    window.location.reload();
  };

  const onMessageReceived = (payload: any) => {
    var payloadData = JSON.parse(payload.body);
    console.log("payloadData onMessageReceived", payloadData);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        publicChats.push(payloadData);
        setPublicChats([...publicChats]);
        break;
      case "LEAVE":
        if (privateChats.get(payloadData.senderName)) {
          setTab("CHATROOM");
          privateChats.delete(payloadData.senderName);
          setPrivateChats(new Map(privateChats));
        }
        break;
    }
  };

  const onPrivateMessage = (payload: any) => {
    console.log(payload);
    var payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onError = (err: string | Frame) => {
    console.log(err);
    userLeft();
  };

  const handleMessage = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setUserData({ ...userData, message: value });
  };

  const sendValue = () => {
    if (stompClient) {
      let chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE",
      };
      console.log(chatMessage);
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateValue = () => {
    if (stompClient) {
      let chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        status: "MESSAGE",
      };
      console.log("tab sendPrivateValue", tab);
      if (userData.username !== tab) {
        console.log("tab sendPrivateValue", privateChats);
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const registerUser = () => {
    connect();
  };

  return (
    <>
      <TopBar />
      <div className="container-fluid position-relative pb-2 pt-2">
        <div className="row pt-5">
          <div className="col-1">&nbsp;</div>
          <div className="col-8">
            <h2>Selamat Datang Admin</h2>
          </div>
        </div>
        {!userData.connected && (
          <div className="row pt-5">
            <div className="row">
              <div className="col-1">&nbsp;</div>
              <div className="col-8">Click tombol untuk memulai</div>
              <div className="col-2">
                {!loading && (
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={registerUser}
                  >
                    <span>Mulai</span>
                  </button>
                )}
                {loading && (
                  <div className="spinner-border text-success" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
              </div>
              <div className="col-1">&nbsp;</div>
            </div>
          </div>
        )}
        {userData.connected ? (
          <div className="row pt-5">
            <div className="col-1">&nbsp;</div>
            <div className="col-10">
              <div className="row" style={{ height: "50vh" }}>
                <div
                  className="col-10 bg-light border-end"
                  style={{
                    height: "90%",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  {tab !== "CHATROOM" && (
                    <ul className="chat-message">
                      {[...privateChats.get(tab)].map((chat, index) => (
                        <li
                          className={`message ${
                            chat.senderName === userData.username && "self"
                          }`}
                          key={index}
                        >
                          {chat.senderName !== userData.username && (
                            <div className="avatar">{chat.senderName}</div>
                          )}
                          <div className="message-data">{chat.message}</div>
                          {chat.senderName === userData.username && (
                            <div className="avatar self">{chat.senderName}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div
                  className="col-2 bg-light"
                  style={{
                    height: "90%",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                >
                  <ul>
                    {[...privateChats.keys()].map(
                      (name, index) =>
                        name !== userData.username && (
                          <li
                            onClick={() => {
                              setTab(name);
                            }}
                            className={`member ${tab === name && "active"}`}
                            key={index}
                          >
                            {name}
                          </li>
                        )
                    )}
                  </ul>
                </div>
              </div>
              <div className="row pt-5 pb-5">
                <div className="col-10">
                  <input
                    type="text"
                    name="sentence"
                    id="sentence"
                    placeholder="Silahkan ketik pesan anda"
                    className="w-100"
                    style={{ verticalAlign: "-webkit-baseline-middle" }}
                    value={userData.message}
                    onChange={handleMessage}
                    disabled={tab === "CHATROOM"}
                  />
                </div>
                <div className="col-2">
                  <button
                    className="btn btn-outline-primary"
                    type="button"
                    onClick={sendPrivateValue}
                  >
                    <span>Kirim</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default Admin;
