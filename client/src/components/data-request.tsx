import styles from "../styles/data-request.module.css";
import { FaBoxOpen, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";

export default function DataRequest() {
  const dataOptions = [
    {
      id: 1,
      icon: <FaBoxOpen className={styles.icon} style={{ color: "#f97316" }} />,
      title: "Your Orders",
      description:
        "This file contains information about your account’s physical and digital order history such as product names, delivery addresses, delivery dates, prices paid, billing information, invoices you have received from Sixpine and returns you have made.",
    },
    {
      id: 2,
      icon: <FaMapMarkerAlt className={styles.icon} style={{ color: "#ef4444" }} />,
      title: "Your Addresses",
      description:
        "This file contains the billing and delivery addresses you have added to your Sixpine account, along with delivery instructions and preferences (e.g., “no delivery on Saturday”), you have given to.",
    },
    {
      id: 3,
      icon: <FaCreditCard className={styles.icon} style={{ color: "#0ea5e9" }} />,
      title: "Payment Options",
      description:
        "This file contains payment information such as details relating to payment instruments you have added or debit cards you have added to your Wallet, gift card information such as the balance, details relating to your use of Sixpine Wallet on third-party sites including the card you used, the amount you paid and the name of the online shop you bought from.",
    },
  ];

  return (
    <div className={styles.Datacontainer}>
      <h2 className={styles.heading}>Request your data</h2>
      <p className={styles.subtext}>
        Please select the data that you want.
      </p>

      <div className={styles.cardList}>
        {dataOptions.map((item) => (
          <div key={item.id} className={styles.card}>
            <div className={styles.cardContent}>
              
              {item.icon}
              <div className={styles.textContent}>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.description}>{item.description}</p>
              </div>
            </div>
            <button className={styles.requestBtn}>Submit Request</button>
          </div>
        ))}
      </div>
    </div>
  );
}
