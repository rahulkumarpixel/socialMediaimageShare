import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import "./App.css";

function App() {
  const shareUrl =
    "https://storage.googleapis.com/alta-booking-d85f1.appspot.com/uploads/images/bannerImage/banner_user_typed_img1-1751607582360-c0ec6fbb-e023-43fb-b7af-7c20f2a2fe4a.png";

  const handleShare = (platform) => {
    let url = "";

    if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`;
      window.open(url, "_blank");
    }

    // ⚠ Instagram does NOT support direct web share
    if (platform === "instagram") {
      alert(
        "Instagram does not allow image share from browser. You can only upload manually."
      );
    }

    // ⚠ TikTok also does NOT support image URL share on web
    if (platform === "tiktok") {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied! Paste it into TikTok.");
    }
  };

  return (
    <div className="container">
      <h1>Share Image</h1>

      <img src={shareUrl} alt="Shared" className="main-img" />

      <div className="share-box">
        <p>Share this image:</p>

        <div className="social-buttons">
          <button onClick={() => handleShare("facebook")} className="btn fb">
            <FaFacebook size={24} />
          </button>

          <button onClick={() => handleShare("instagram")} className="btn ig">
            <FaInstagram size={24} />
          </button>

          <button onClick={() => handleShare("tiktok")} className="btn tk">
            <FaTiktok size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
