import { useState } from 'react';
import styles from '../styles/loginsecurity.module.css';

const LoginSecurity = () => {
    const [name, setName] = useState('Sixpine');
    const [email, setEmail] = useState('miliyaqatm@gmail.com');
    const [mobile, setMobile] = useState('+91 8865884786');
    const [password, setPassword] = useState('********');
    const [twoStepVerification, setTwoStepVerification] = useState('9897268972');

    const [editingField, setEditingField] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState('');

    const handleEditClick = (field: string, currentValue: string) => {
        setEditingField(field);
        setInputValue(currentValue);
    };

    const handleSave = (field: string) => {
        switch (field) {
            case 'name':
                setName(inputValue);
                break;
            case 'email':
                setEmail(inputValue);
                break;
            case 'mobile':
                setMobile(inputValue);
                break;
            case 'password':
                setPassword(inputValue); // In a real app, this would be more complex (e.g., hashing)
                break;
            case 'twoStepVerification':
                setTwoStepVerification(inputValue);
                break;
            default:
                break;
        }
        setEditingField(null);
        setInputValue('');
    };

    const handleCancel = () => {
        setEditingField(null);
        setInputValue('');
    };

    const renderField = (field: string, label: string, value: string, description: string | null = null) => (
        <div className={styles.securityItem}>
            <div className={styles.securityInfo}>
                <span className={styles.label}>{label}</span>
                {editingField === field ? (
                    <input
                        type={field === 'password' ? 'password' : 'text'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={styles.editInput}
                    />
                ) : (
                    <span className={styles.value}>{value}</span>
                )}
                {description && <p className={styles.description}>{description}</p>}
            </div>
            <div className={styles.securityActions}>
                {editingField === field ? (
                    <>
                        <button className={styles.saveButton} onClick={() => handleSave(field)}>Save</button>
                        <button className={styles.cancelButton} onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <button className={styles.editButton} onClick={() => handleEditClick(field, value)}>EDIT</button>
                )}
            </div>
        </div>
    );

    return (
        <div className={styles.logincontainer}>
            <div className={styles.header}>
                <a href="/your-account">Your Account</a> / <a href="/membership-plans">Membership Plans</a>
            </div>
            
            <h2 className={styles.sectionTitle}>Login & Security</h2>
            <div className={styles.main} >

            <div className={styles.securitySection}>
                {renderField('name', 'Name', name)}
                {renderField('email', 'Email', email)}
                {renderField(
                    'mobile',
                    'Primary mobile number',
                    mobile,
                    'Quickly sign in, easily recover passwords and receive security notifications with this number.'
                )}
                {renderField('password', 'Password', password)}
                {renderField(
                    'twoStepVerification',
                    '2-Step Verification',
                    twoStepVerification,
                    'Enter a code sent to your verification method, in addition to your password, to sign in securely.'
                )}

                <div className={`${styles.securityItem} ${styles.compromisedAccount}`}>
                    <div className={styles.securityInfo}>
                        <span className={styles.label}>Compromised Account</span>
                        <p className={styles.description}>Take steps like changing your password and signing out everywhere.</p>
                    </div>
                    <div className={styles.securityActions}>
                        <button className={styles.manageButton}>Manage</button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LoginSecurity;