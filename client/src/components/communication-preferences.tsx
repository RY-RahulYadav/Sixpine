import { useState } from "react";
import styles from "../styles/communication-preferences.module.css";

export default function CommunicationPreferences() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");

  const handleOpenPopup = (content: string) => {
    setPopupContent(content);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupContent("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Communication Preferences Centre</h2>
      <p className={styles.subtext}>
        We’d like to stay in touch, but only in ways that you find useful.
      </p>

      {/* WhatsApp Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>WhatsApp Preferences</h3>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>General Settings</span>
            <span>
              WhatsApp notifications are currently being sent to 91•••754{" "}
              <button
                className={styles.changeBtn}
                onClick={() => handleOpenPopup("Change WhatsApp number")}
              >
                Change
              </button>
            </span>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox" defaultChecked />
              Key order updates, shipments, payments and more
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              Personalised deals, recommendations, sales events, and more
            </label>
            <p className={styles.hint}>
              You can turn off notifications on WhatsApp
            </p>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn}>Cancel</button>
            <button className={styles.updateBtn}>Update</button>
          </div>
        </div>
      </div>

      {/* SMS Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>SMS Preferences</h3>
        <p className={styles.subtext}>
          You consent to receive automated text messages regarding issues with
          your order, account security, or other customer service purposes from
          or on behalf of Sixpine at the mobile number provided below.
        </p>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>General Settings</span>
            <span>
              SMS notifications are being sent to 91•••678{" "}
              <button
                className={styles.changeBtn}
                onClick={() => handleOpenPopup("Change SMS number")}
              >
                Change
              </button>
            </span>
          </div>

          <div className={styles.radioGroup}>
            <label>
              <input type="radio" name="sms" />
              Send SMS messages from 08:00 → 23:00
            </label>
            <label>
              <input type="radio" name="sms" defaultChecked />
              SMS notifications are sent from 06:00 → 23:00
            </label>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn}>Cancel</button>
            <button className={styles.updateBtn}>Update</button>
          </div>
        </div>
      </div>


      {/* Email  Preferences */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Email  Preferences</h3>
        

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>General Settings</span>
            <span>
              email notifications are being sent to sixpine@gmail.com{" "}
              <button
                className={styles.changeBtn}
                onClick={() => handleOpenPopup("Change email ID")}
              >
                Change
              </button>
            </span>
          </div>

           <div className={styles.checkboxGroup}>
            <label>
              <input type="checkbox" defaultChecked />
              Promotional Emails
            </label>
          </div>

          <div className={styles.actions}>
            <button className={styles.cancelBtn}>Cancel</button>
            <button className={styles.updateBtn}>Update</button>
          </div>
        </div>
      </div>


      {/* Popup */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h4>{popupContent}</h4>
            <p>You can add your custom form or settings here.</p>
            <button className={styles.closeBtn} onClick={handleClosePopup}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
