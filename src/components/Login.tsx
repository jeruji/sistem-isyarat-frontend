import React, { ChangeEvent, useEffect, useState } from "react";
import TopBar from "./TopBar";
import SockJS from "sockjs-client";
import ReactPlayer from "react-player";
import { Client, Frame, over } from "stompjs";
import retrieve from "../services/retrieve";

var stompClient: Client = null;
const Login = () => {
  type ListVideoType = {
    id: string;
    name: string;
    file: string;
  };

  const serverURL = process.env.REACT_APP_SERVER_URL;
  const videoURL = process.env.REACT_APP_VIDEO_URL;
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("admin");
  const [userData, setUserData] = useState({
    username: "",
    receivername: "",
    connected: false,
    message: "",
  });
  const [currentVideo, setCurrentVideo] = useState<string>();
  const [indexVideo, setIndexVideo] = useState<number>(0);
  const [videos, setVideos] = useState<ListVideoType[]>();

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const connect = () => {
    setLoading(true);
    privateChats.set("admin", []);
    setPrivateChats(new Map(privateChats));

    let Sock = new SockJS(serverURL);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setLoading(false);
    setUserData({ ...userData, connected: true });
    stompClient.subscribe("/chatroom/public", onMessageReceived);
    stompClient.subscribe(
      `/user/${userData.username}/private`,
      onPrivateMessage
    );
    userJoin();
  };

  const userLeft = () => {
    let chatMessage = {
      senderName: userData.username,
      status: "LEAVE",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
    window.location.reload();
  };

  const userJoin = () => {
    let chatMessage = {
      senderName: userData.username,
      status: "JOIN",
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload: any) => {
    let payloadData = JSON.parse(payload.body);
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
    }
  };

  const onPrivateMessage = (payload: any) => {
    console.log("payload private", payload);
    let payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
      getSigns(payloadData.message);
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

  const handleUsername = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setUserData({ ...userData, username: value });
  };

  const registerUser = () => {
    connect();
  };

  const getSigns = (sentence: string) => {
    retrieve.retrieveListVideo(sentence).then((response: ListVideoType[]) => {
      setVideos(response);
      setCurrentVideo(`${response[0].id}/${response[0].name}.mp4`);
      setIndexVideo(0);
    });
  };

  const setNextVideo = () => {
    if (indexVideo + 1 < videos.length) {
      setIndexVideo(indexVideo + 1);
      setCurrentVideo(`${videos[indexVideo + 1].id}/${videos[indexVideo + 1].name}.mp4`);
    } else {
      setCurrentVideo("");
    }
  };

  return (
    <>
      <TopBar />
      <div className="container-fluid position-relative pb-2 pt-2gbb">
        {!userData.connected ? (
          <>
            <div className="row pt-5">
              <div className="col-1">&nbsp;</div>
              <div className="col-8">
                <h2>
                  Selamat Datang, Silahkan Ketik Nama Anda dan Tekan Tombol
                  Login
                </h2>
              </div>
            </div>
            <div className="row pt-5">
              <div className="col-1">&nbsp;</div>
              <div className="col-9">
                <input
                  type="text"
                  name="userName"
                  id="user-name"
                  placeholder="Ketik Nama Anda"
                  className="w-100"
                  style={{ verticalAlign: "-webkit-baseline-middle" }}
                  value={userData.username}
                  onChange={handleUsername}
                />
              </div>
              <div className="col-2">
                {!loading && (
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={registerUser}
                  >
                    <span>Login</span>
                  </button>
                )}
                {loading && (
                  <div className="spinner-border text-success" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="row pt-5">
              <div className="col-1">&nbsp;</div>
              <div className="col-8">
                <h2>Selamat Datang {userData.username}</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-1">&nbsp;</div>
              <div className="col-10">
                <div className="row">
                  <div className="col-12">
                    <div className="row pt-5" style={{ minHeight: "50vh" }}>
                      <div className="col-10 bg-light">
                        <div
                          className="row"
                          style={{
                            height: "90%",
                            overflowY: "auto",
                            overflowX: "hidden",
                          }}
                        >
                          <div className="col-10 bg-light">
                            <ul className="chat-message">
                              {[...privateChats.get(tab)].map((chat, index) => {
                                console.log("chat", chat);
                                console.log("index", index);
                                return (
                                  <>
                                    <li
                                      className={`message ${
                                        chat.senderName === userData.username &&
                                        "self"
                                      }`}
                                      key={index}
                                    >
                                      {chat.senderName !==
                                        userData.username && (
                                        <div className="avatar">
                                          {chat.senderName}
                                        </div>
                                      )}
                                      <div className="message-data">
                                        {chat.message}
                                      </div>
                                      {chat.senderName ===
                                        userData.username && (
                                        <div className="avatar self">
                                          {chat.senderName}
                                        </div>
                                      )}
                                    </li>

                                    {currentVideo !== "" &&
                                      index ===
                                        [...privateChats.get(tab)].length -
                                          1 && (
                                        <div className="row pt-5">
                                          <ReactPlayer
                                            url={`${videoURL}${currentVideo}`}
                                            controls={true}
                                            playing={true}
                                            onEnded={() => {
                                              setNextVideo();
                                            }}
                                            style={{
                                              marginLeft: "auto",
                                              marginRight: "auto",
                                            }}
                                            width="70vw"
                                            height="70vh"
                                          />
                                        </div>
                                      )}
                                  </>
                                );
                              })}
                            </ul>
                          </div>
                          <div className="col-2">&nbsp;</div>
                        </div>
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
                          value={userData.message}
                          onChange={handleMessage}
                        />
                      </div>
                      <div className="col-1">
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={sendPrivateValue}
                        >
                          <span>Kirim</span>
                        </button>
                      </div>
                      <div className="col-1">
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={userLeft}
                        >
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-1">&nbsp;</div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Login;
