import { useNavigate } from "react-router-dom";
import "./Settings.css";

const UserSettings = () => {
  const navigate = useNavigate();

  const accountLinks = [
    {
      title: "Change Username",
      description: "Update your display username",
      action: () => navigate("/user/edit-profile"),
    },
    {
      title: "Change Password",
      description: "Set a new password for your account",
      action: () => navigate("/user/edit-profile"),
    },
    {
      title: "Edit Profile",
      description: "Update bio, email, and profile picture",
      action: () => navigate("/user/edit-profile"),
    },
  ];

  return (
    <div className="user-settings-page">
      <div className="user-settings-container">
        <h1>Settings</h1>

        <section className="settings-section">
          <h2>Account</h2>
          <p className="settings-note">
            Username and password changes are managed on the Edit Profile page.
          </p>

          <div className="settings-link-list">
            {accountLinks.map((item) => (
              <button
                key={item.title}
                type="button"
                className="settings-link-card"
                onClick={item.action}
              >
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <span>→</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserSettings;
