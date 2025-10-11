import { useState } from 'react';
import styles from './BulkOrder.module.css';

const BulkOrderForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    orderType: 'office',
    quantity: '',
    requirements: '',
    budget: '',
    delivery: '',
    hearAbout: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission - API call can be implemented here
    console.log('Form submitted:', formData);
    // Reset form or show success message
    alert('Your bulk order inquiry has been submitted. Our team will contact you within 24 hours.');
  };

  return (
    <div className={styles.bulkOrderFormSection}>
      <h2 className={styles.sectionTitle}>Request a Bulk Order Quote</h2>
      <p className={styles.sectionDescription}>
        Fill out the form below to get a customized quote for your bulk order requirements.
        Our business team will contact you within 24 hours.
      </p>
      
      <form className={styles.bulkOrderForm} onSubmit={handleSubmit}>
        <div className={styles.formColumns}>
          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="company">Company Name *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="Enter your company name"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="orderType">Order Type *</label>
              <select
                id="orderType"
                name="orderType"
                value={formData.orderType}
                onChange={handleChange}
                required
              >
                <option value="office">Office Furniture</option>
                <option value="home">Home Furniture</option>
                <option value="hotel">Hotel Furniture</option>
                <option value="school">Educational Institution</option>
                <option value="hospital">Healthcare Facility</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className={styles.formColumn}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Approximate Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                placeholder="Enter approximate quantity"
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="budget">Budget Range</label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
              >
                <option value="">Select budget range</option>
                <option value="<100000">Less than ₹1,00,000</option>
                <option value="100000-500000">₹1,00,000 - ₹5,00,000</option>
                <option value="500000-1000000">₹5,00,000 - ₹10,00,000</option>
                <option value=">1000000">More than ₹10,00,000</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="delivery">Expected Delivery Timeline</label>
              <select
                id="delivery"
                name="delivery"
                value={formData.delivery}
                onChange={handleChange}
              >
                <option value="">Select timeline</option>
                <option value="urgent">Urgent (Within a week)</option>
                <option value="standard">Standard (2-3 weeks)</option>
                <option value="flexible">Flexible (1-2 months)</option>
                <option value="planned">Planned (3+ months)</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="hearAbout">How did you hear about us?</label>
              <select
                id="hearAbout"
                name="hearAbout"
                value={formData.hearAbout}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="search">Search Engine</option>
                <option value="social">Social Media</option>
                <option value="recommendation">Recommendation</option>
                <option value="advertisement">Advertisement</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="requirements">Specific Requirements *</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe your requirements, including product details, customization needs, etc."
              />
            </div>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <div className={styles.formDisclaimer}>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">
              I agree to Sixpine's <a href="/privacy-policy">Privacy Policy</a> and <a href="/terms">Terms of Service</a>
            </label>
          </div>
          
          <button type="submit" className={styles.submitButton}>Submit Inquiry</button>
        </div>
      </form>
    </div>
  );
};

export default BulkOrderForm;