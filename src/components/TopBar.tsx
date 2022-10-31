import React from "react";

const TopBar = () => {
  return (
    <div className="container-fluid bg-light position-relative pb-2 pt-2">
      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-1">&nbsp;</div>
            <div className="col-2">
              <img src="/images/indr.png" alt="Pengadilan Negeri Indramayu" />
            </div>
            <div className="col-1">&nbsp;</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
