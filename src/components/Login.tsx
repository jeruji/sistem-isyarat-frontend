import React, { useEffect, useState } from "react";
import TopBar from "./TopBar";
import Translate from "./Translate";

const Login = () => {

  const [username, setUsername] = useState("");
  const [showMessageField, setShowMessageField] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(false);
  }, [loading]);

  const onLogin = () => {
    setShowMessageField(true);
  };

  return (
    !loading && (
      <>
        <TopBar />
        <div className="container-fluid position-relative pb-2 pt-2gbb">
          {!showMessageField && (
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
                    name="sentence"
                    id="sentence"
                    placeholder="Ketik Nama Anda"
                    className="w-100"
                    onChange={(event) => {
                      setUsername(event.target.value);
                    }}
                  />
                </div>
                <div className="col-2">
                  <button onClick={() => onLogin()}>
                    <span>Login</span>
                  </button>
                </div>
              </div>
            </>
          )}
          {showMessageField && (
            <Translate
              username={username}
            />
          )}
        </div>
      </>
    )
  );
};

export default Login;
