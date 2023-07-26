import React, { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import retrieve from "../services/retrieve";

type MessageType = {
  from: string;
  to: string;
  message: string;
};

interface IProps {
  username: string;
  messages: MessageType[];
  chatUser: string;
}

const serverURL = process.env.REACT_APP_SERVER_URL;

const Translate: FunctionComponent<IProps> = (props) => {
  type ListVideoType = {
    id: string;
    name: string;
    file: string;
  };

  const [videos, setVideos] = useState<ListVideoType[]>();
  const [currentVideo, setCurrentVideo] = useState<string>("");
  const [sentence, setSentence] = useState<string>();
  const [messageInputValue, setMessageInputValue] = useState("");
  const [indexVideo, setIndexVideo] = useState<number>(0);

  const { messages, username, chatUser } = props;

  useEffect(() => {}, []);

  const getSigns = () => {
    retrieve.retrieveListVideo(sentence).then((response: ListVideoType[]) => {
      setVideos(response);
      setCurrentVideo(response[0].name);
      setIndexVideo(0);
    });
  };

  const setNextVideo = () => {
    if (indexVideo + 1 < videos.length) {
      setIndexVideo(indexVideo + 1);
      setCurrentVideo(videos[indexVideo + 1].name);
    } else {
      setCurrentVideo("");
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (messageInputValue && messageInputValue.trim() !== "") {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: chatUser,
          to: username,
          message: messageInputValue.trim(),
        }),
      };

      const response = await fetch(
        `${serverURL}/sibi/user/message`,
        requestOptions
      );

      if (response.status === 200) {
        setMessageInputValue("");
      }
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageInputValue(event.target.value);
  };

  return (
    <div className="container-fluid position-relative pb-2 pt-2">
      <div className="row">
        <div className="col-1">&nbsp;</div>
        <div className="col-10">
          <div className="row">
            <div className="col-12">
              <div className="row">
                <div className="col-12 bg-light">
                  <div className="row">
                    <div className="col-12">
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
                  <div className="row">
                    <div className="col-12">
                      {messages
                        ? messages.map((message, index) =>
                            message.to &&
                            message.from === username &&
                            message.to === chatUser ? (
                              <div key={index} className="message-item-owner">
                                <span>{message.message}</span>
                                <br />
                              </div>
                            ) : (
                              ""
                            )
                          )
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
              <form className="send-message-form" onSubmit={sendMessage}>
                <div className="row pt-5 pb-5">
                  <div className="col-10">
                    <input
                      type="text"
                      name="sentence"
                      id="sentence"
                      placeholder="Type Text to Translate"
                      className="w-100"
                      value={messageInputValue}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-2">
                    <button className="unit" type="submit">
                      <span>Kirim</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-1">&nbsp;</div>
      </div>
    </div>
  );
};

export default Translate;
