import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth, useWatchLater } from "contexts";
import axios from "axios";
import { isVideoInWatchLater } from "utils";

export const VideoCard = ({
  filtervideo,
  setShowPlaylistModal,
  setPlaylistVideo,
}) => {
  const navigate = useNavigate();
  const { isLoggedIn, token } = useAuth();
  const [card, setCard] = useState(false);
  const { watchLaterState, watchLaterDispatch } = useWatchLater();
  const videoInWatchLater = isVideoInWatchLater(
    filtervideo._id,
    watchLaterState.watchLater
  );

  const cardPopUp = () => {
    setCard((prev) => !prev);
  };

  const watchLaterHandler = async () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      if (!videoInWatchLater) {
        try {
          const response = await axios.post(
            "/api/user/watchlater",
            { video: filtervideo },
            {
              headers: { authorization: token },
            }
          );
          watchLaterDispatch({
            type: "ADD_TO_WATCH_LATER",
            payload: response.data.watchlater,
          });
        } catch (e) {
          console.log(e);
        }
      } else {
        try {
          const response = await axios.delete(
            `/api/user/watchlater/${filtervideo._id}`,
            {
              headers: { authorization: token },
            }
          );
          watchLaterDispatch({
            type: "DELETE_FROM_WATCH_LATER",
            payload: response.data.watchlater,
          });
        } catch (e) {
          console.log(e);
        }
      }
    }
  };

  const addPlaylist = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      setShowPlaylistModal(true);
      setPlaylistVideo(filtervideo);
      setCard(false);
    }
  };

  return (
    <section className="card badge-card" key={filtervideo._id}>
      <button className="timing">{filtervideo.time}</button>
      <Link to={`/videoPlayer/${filtervideo._id}`} className="video-link">
        <img
          className="img"
          src={`https://i.ytimg.com/vi/${filtervideo.thumbnail}.jpg`}
          alt="card-thumbnail"
        />
      </Link>
      <i
        className="cursor-pointer fas fa-ellipsis-v"
        onClick={() => cardPopUp()}
      ></i>
      {card && (
        <div className="card-pop-up">
          <p className="cursor-pointer playlist" onClick={() => addPlaylist()}>
            <i className="fas fa-list"></i>Save to Playlist
          </p>
          <p
            className="cursor-pointer watch"
            onClick={() => watchLaterHandler()}
          >
            {videoInWatchLater ? (
              <i className="fas fa-check-circle"></i>
            ) : (
              <i className="far fa-clock"></i>
            )}
            Watch Later
          </p>
          <i
            className="cursor-pointer fas fa-times"
            onClick={() => cardPopUp()}
          ></i>
        </div>
      )}
      <div className="card-text">
        <section className="avatar flex">
          <span className="round-avatar">
            <img
              className="round sm"
              src={`https://yt3.ggpht.com/${filtervideo.avatar}=s176-c-k-c0x00ffffff-no-rj-mo`}
              alt="avatar-image"
            />
          </span>
          <span>
            <h4 className="title">{filtervideo.title}</h4>
            <small>{filtervideo.creator}</small>
            <div>
              <small className="card-view">
                <i className="fas fa-eye"></i>
                {filtervideo.views} views
              </small>
              <small>
                <i className="far fa-dot-circle"></i>
                {filtervideo.days}
              </small>
            </div>
          </span>
        </section>
      </div>
    </section>
  );
};
