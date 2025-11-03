import React, { useState, useEffect } from 'react';
import styles from './PaymentPreferenceModal.module.css';

interface PaymentPreference {
  id?: number;
  preferred_method?: string;
  preferred_card_token_id?: string;
  preferred_address_id?: number;
  payment_nickname?: string;
}

interface SavedCard {
  token_id: string;
  method: string;
  card: {
    last4: string;
    network: string;
    type: string;
    issuer: string;
  };
}

interface Address {
  id: number;
  type: string;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface PaymentPreferenceModalProps {
  preference: PaymentPreference | null;
  savedCards: SavedCard[];
  addresses: Address[];
  editingCard?: SavedCard | null;
  onClose: () => void;
  onSave: (data: {
    preferred_method: string;
    preferred_address_id?: number;
    preferred_card_token_id?: string;
    payment_nickname?: string;
  }) => void;
}

const PaymentPreferenceModal: React.FC<PaymentPreferenceModalProps> = ({
  preference,
  savedCards,
  addresses,
  editingCard,
  onClose,
  onSave
}) => {
  const [preferredMethod, setPreferredMethod] = useState(preference?.preferred_method || 'card');
  const [selectedAddressId, setSelectedAddressId] = useState<number | undefined>(
    preference?.preferred_address_id
  );
  const [selectedCardTokenId, setSelectedCardTokenId] = useState<string | undefined>(
    preference?.preferred_card_token_id
  );
  const [nickname, setNickname] = useState(preference?.payment_nickname || '');

  useEffect(() => {
    if (editingCard) {
      setSelectedCardTokenId(editingCard.token_id);
      setPreferredMethod('card');
      // Set nickname from preference if this card is preferred
      if (preference?.preferred_card_token_id === editingCard.token_id) {
        setNickname(preference.payment_nickname || '');
      }
    }
  }, [editingCard, preference]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: any = {
      preferred_method: preferredMethod,
      payment_nickname: nickname || undefined
    };

    if (selectedAddressId) {
      data.preferred_address_id = selectedAddressId;
    }

    if (preferredMethod === 'card' && selectedCardTokenId) {
      data.preferred_card_token_id = selectedCardTokenId;
    } else if (preferredMethod !== 'card') {
      // Clear card token if method is not card
      data.preferred_card_token_id = null;
    }

    onSave(data);
  };

  const formatCardName = (card: SavedCard) => {
    const issuer = card.card.issuer || '';
    const network = card.card.network || '';
    const last4 = card.card.last4 || '';
    
    if (issuer && network) {
      return `${issuer} ${network} ending in ${last4}`;
    } else if (network) {
      return `${network} ending in ${last4}`;
    } else {
      return `Card ending in ${last4}`;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {editingCard ? 'Edit Payment Preference' : 'Set Payment Preference'}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Payment Method *</label>
            <select
              className={styles.select}
              value={preferredMethod}
              onChange={(e) => {
                setPreferredMethod(e.target.value);
                if (e.target.value !== 'card') {
                  setSelectedCardTokenId(undefined);
                } else if (savedCards.length > 0 && !selectedCardTokenId) {
                  // Auto-select first card if available
                  setSelectedCardTokenId(savedCards[0].token_id);
                }
              }}
              required
            >
              <option value="card">Credit/Debit Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="upi">UPI</option>
              <option value="wallet">Digital Wallet</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          {preferredMethod === 'card' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Card</label>
              {savedCards.length > 0 ? (
                <select
                  className={styles.select}
                  value={selectedCardTokenId || ''}
                  onChange={(e) => setSelectedCardTokenId(e.target.value || undefined)}
                >
                  <option value="">Select a card</option>
                  {savedCards.map(card => (
                    <option key={card.token_id} value={card.token_id}>
                      {formatCardName(card)}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <p className={styles.helpText} style={{ color: '#b12704', marginTop: '4px' }}>
                    No saved cards available.
                  </p>
                  <p className={styles.helpText}>
                    Cards will be saved when you make a payment with "Save Card" option during checkout.
                  </p>
                </>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Shipping Address</label>
            {addresses.length > 0 ? (
              <select
                className={styles.select}
                value={selectedAddressId || ''}
                onChange={(e) => setSelectedAddressId(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Select an address</option>
                {addresses.map(address => (
                  <option key={address.id} value={address.id}>
                    {address.full_name} - {address.street_address}, {address.city}, {address.state} {address.postal_code}
                    {address.is_default && ' (Default)'}
                  </option>
                ))}
              </select>
            ) : (
              <p className={styles.helpText} style={{ color: '#b12704' }}>
                No addresses found. Please add an address first.
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Nickname (Optional)</label>
            <input
              type="text"
              className={styles.input}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., My Default Card, Work Address"
              maxLength={100}
            />
            <p className={styles.helpText}>
              Give your payment preference a nickname for easier identification.
            </p>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Preference
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPreferenceModal;

