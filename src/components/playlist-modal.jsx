import "styles/playlist-modal.css";
import { AiOutlineClose } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import { useState } from "react";
import { useAuth, usePlaylist } from "contexts";
import axios from "axios";
import { isNewPlaylist, isNewPlaylistVideo } from "utils";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const PlaylistModal = ({ video }) => {
  const { token } = useAuth();
  const [input, setInput] = useState(false);
  const [newInput, setNewInput] = useState("");
  const { playlistDispatch, playlistState, setShowPlaylistModal } =
    usePlaylist();
  const newPlaylist = isNewPlaylist(newInput, playlistState.playlists);

  const addPlaylistHandler = () => {
    setInput((prev) => !prev);
  };

  const playlistVideosHandler = async (e, playlistId) => {
    if (e.target.checked) {
      try {
        await axios.post(
          `/api/user/playlists/${playlistId}`,
          { video },
          {
            headers: { authorization: token },
          }
        );
        playlistDispatch({
          type: "ADD_VIDEO_TO_PLAYLIST",
          payload: { video, playlistId },
        });
        toast.success("Video added to playlist");
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const videoId = video._id;
        await axios.delete(`/api/user/playlists/${playlistId}/${video._id}`, {
          headers: { authorization: token },
        });
        playlistDispatch({
          type: "DELETE_VIDEO_TO_PLAYLIST",
          payload: { videoId, playlistId },
        });
        toast.error("Video removed from playlist");
      } catch (e) {
        console.log(e);
      }
    }
  };

  const addNewPlaylist = async () => {
    if (!newPlaylist) {
      try {
        const response = await axios.post(
          "/api/user/playlists",
          {
            playlist: { title: newInput },
          },
          {
            headers: { authorization: token },
          }
        );
        playlistDispatch({
          type: "ADD_NEW_PLAYLIST",
          payload: response.data.playlists,
        });
        toast.success("Playlist added");
      } catch (e) {
        console.log(e);
      }
    } else {
      toast.warning("playlist already exists");
    }
    setNewInput("");
    setInput(false);
  };

  return (
    <section className="playlist-modal">
      <div className="playlist-modal-container">
        <div className="head">
          <span>Save to playlist</span>
          <AiOutlineClose
            className="cursor-pointer close"
            onClick={() => setShowPlaylistModal(false)}
          />
        </div>
        <div className="divider"></div>
        {playlistState.playlists.length !== 0 &&
          playlistState.playlists.map((playlist, index) => (
            <label className="label" key={index}>
              <input
                className="input"
                type="checkbox"
                checked={isNewPlaylistVideo(video?._id, playlist.videos)}
                onChange={(e) => playlistVideosHandler(e, playlist._id)}
              />
              {playlist.title}
            </label>
          ))}
        {input && (
          <>
            <input
              className="add-inp"
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
            />
            <button className="add-btn" onClick={() => addNewPlaylist()}>
              Add
            </button>
          </>
        )}
        <button className="btn" onClick={() => addPlaylistHandler()}>
          <BsPlusLg className="plus" />
          Create playlist
        </button>
      </div>
      <ToastContainer autoClose={2000} />
    </section>
  );
};
