import React, { ChangeEvent, FunctionComponent, useState } from "react";

const serverURL = process.env.REACT_APP_SERVER_URL;

type MessageType = {
  from: string;
  to: string;
  message: string;
};

type PropsType = {
  key: number;
  index: number;
  divRefs: any;
  messages: MessageType[];
  username: string;
  chatUser: string;
};

const ChatBox: FunctionComponent<PropsType> = (props) => {
  const { divRefs, messages, username, chatUser, index } = props;
  const [messageInputValue, setMessageInputValue] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessageInputValue(event.target.value);
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (messageInputValue && messageInputValue.trim() !== "") {
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: username,
          to: chatUser,
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

  return (
    <div className="container-fluid position-relative pb-2 pt-2">
      <div className="row pt-5">
        <div className="col-1">&nbsp;</div>
        <div className="col-8">
          <div className="card">
            <div className="card-title">
              Terkoneksi dengan <b>{chatUser}</b>
            </div>

            <div className="message-area-maindiv">
              <div
                className="message-area"
                ref={(element) => {
                  divRefs.current[index] = element;
                }}
                id="scroll-style"
              >
                <div className="message-sender">
                  {messages
                    ? messages.map((message, index) =>
                        message.to &&
                        message.from === username &&
                        message.to === chatUser ? (
                          <div key={index} className="message-item-owner">
                            <span>{message.message}</span>
                            <br />
                          </div>
                        ) : message.from === chatUser ? (
                          <div key={index} className="message-item-sender">
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
            <div className="row pt-4">
              <form className="send-message-form" onSubmit={sendMessage}>
                <div className="col-1">&nbsp;</div>
                <div className="col-7">
                  <input
                    type="text"
                    placeholder="Type Text to Translate"
                    className="message-input"
                    value={messageInputValue}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-1">
                  <button type="submit" className="w-100">
                    <span>Send</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-2 bg-light">&nbsp;</div>
        <div className="col-1">&nbsp;</div>
      </div>
    </div>
  );
};

export default ChatBox;
