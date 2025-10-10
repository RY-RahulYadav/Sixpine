import { useState } from "react";
import styles from "../styles/CloseYourSixpineAccount.module.css";
import { AlertTriangle } from "lucide-react";

export default function CloseYourSixpineAccount() {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm) {
      alert("⚠️ Please check the confirmation box before proceeding.");
      return;
    }
    alert(
      `✅ Your Sixpine account will be closed permanently.\nReason: ${
        reason || "Not provided"
      }`
    );
    // 👉 Yahan API call laga sakte ho for backend request
  };

  return (
    <div className={styles.main}>
      <h2>Close Your Sixpine Account</h2>
      <p className={styles.note}>Please read this carefully</p>

      <p>
        You are about to submit a request to permanently close your Sixpine
        account and have your data deleted. Once your account is closed, all
        products and services linked to it will no longer be accessible across
        any Sixpine platforms. For example, submitting your closure request here
        will also deactivate your account on other Sixpine regional sites where
        you use the same login credentials to access services and products.
      </p>
      <p>
        If you have uploaded your own content to any of our services (for
        example, images, videos, or documents), we recommend downloading a copy
        before closing your account.
      </p>

      {/* Warning box */}
      <div className={styles.warningBox}>
        <AlertTriangle className={styles.icon} />
        <div>
          <strong>Account Closure is a Permanent Action</strong>
          <p>
            Please note: account closure is permanent, and once your account is
            closed it will no longer be available to you and cannot be reversed.
            If you close but later wish to use Sixpine services again, you will
            need to create a new account.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label htmlFor="reason">
          Please select the main reason for closing your Sixpine account
          (Optional)
        </label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Choose Reason</option>
          <option value="Privacy concerns">Privacy concerns</option>
          <option value="Not satisfied with services">
            Not satisfied with services
          </option>
          <option value="Too many notifications">Too many notifications</option>
          <option value="Other">Other</option>
        </select>

       <label className={styles.checkbox}>
  <input
    type="checkbox"
    checked={confirm}
    onChange={(e) => setConfirm(e.target.checked)}
  />
  Yes, I want to permanently close my Sixpine Account and
  <span className={styles.mobileBreak}><br /></span>
  <strong> delete my data.</strong>
</label>


        <button type="submit" className={styles.submitBtn}>
          Close My Account
        </button>
      </form>

      <p className={styles.footerNote}>
        Please note that Sixpine is legally required or permitted to retain
        certain types of information, such as your order history. This is done
        in accordance with applicable law, including those related to tax,
        accounting, and fraud prevention.
      </p>
    </div>
  );
}
