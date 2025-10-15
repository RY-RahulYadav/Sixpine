import React from 'react';
import styles from './ProfileSection.module.css';

const ProfileSection: React.FC = () => {
  return (
    <div className={styles['sx-profile-hub-container']}>
      <div className={`${styles['sx-profile-header']} ${styles['sx-desktop']} ${styles['sx-lop-header']}`}>
        <img
          alt="Profile image"
          className={`${styles['sx-profile-avatar']} ${styles['sx-desktop']}`}
          src="https://m.media-amazon.com/images/G/01/IdentityAvatarService/Prod/DefaultAvatars/identity-avatar-head-n-shoulder-default-299BD1.png"
        />
        <div className={`${styles['sx-profile-name-container']} ${styles['sx-desktop']}`}>
          <div className={`${styles['sx-profile-name']} ${styles['sx-desktop']}`}>Rahul Yadav</div>
          <span className={styles['sx-edit-profile']}>
            <div className={`${styles['sx-a-changeover']} ${styles['sx-edit-name-changeover']}`} style={{ display: 'none' }}>
              <div className={styles['sx-a-changeover-inner']}>
                <i className={`${styles['sx-a-icon']} ${styles['sx-a-icon-checkmark-inverse']}`} />
                <strong className={styles['sx-a-size-medium']}>Profile name has been updated</strong>
              </div>
            </div>
            <span
              className={styles['sx-a-declarative']}
              data-a-modal='{"name":"editProfileModal","header":"Edit profile name","width":350}'
              data-action="a-modal">
              <button className={styles['sx-edit-pencil-icon-button']}>
                <svg
                  aria-label="Edit your details"
                  className={styles['sx-edit-name-icon']}
                  fill="none"
                  height="20"
                  role="img"
                  viewBox="0 0 20 20"
                  width="20"
                  xmlns="http://www.w3.org/2000/svg">
                  <title>Edit your details</title>
                  <path
                    d="M17.23 4.23001L15.77 2.77001C15.2997 2.30225 14.6633 2.03967 14 2.03967C13.3367 2.03967 12.7003 2.30225 12.23 2.77001L2.6 12.41C2.40983 12.5964 2.25879 12.8189 2.15576 13.0645C2.05273 13.31 1.99977 13.5737 2 13.84V17C2 17.2652 2.10536 17.5196 2.29289 17.7071C2.48043 17.8947 2.73478 18 3 18H6.18C6.70958 17.9978 7.21665 17.7856 7.59 17.41L17.23 7.77001C17.4628 7.53778 17.6475 7.2619 17.7736 6.95818C17.8996 6.65445 17.9645 6.32885 17.9645 6.00001C17.9645 5.67117 17.8996 5.34557 17.7736 5.04184C17.6475 4.73812 17.4628 4.46224 17.23 4.23001ZM11.23 6.62001L13.4 8.79001L7.61 14.56L5.44 12.39L11.23 6.62001ZM6.18 16H4V13.82L6.2 16H6.18ZM15.82 6.35001L14.82 7.35001L12.62 5.21001L13.62 4.21001C13.7147 4.1207 13.8399 4.07095 13.97 4.07095C14.1001 4.07095 14.2253 4.1207 14.32 4.21001L15.79 5.68001C15.8771 5.76812 15.9285 5.88544 15.934 6.00923C15.9395 6.13303 15.8989 6.25447 15.82 6.35001Z"
                    fill="#0F1111"
                  />
                </svg>
              </button>
            </span>
            <div className={`${styles['sx-a-popover-preload']}`} id="a-popover-editProfileModal">
              <span id="editProfileModal">
                <span>
                  <div className={styles['sx-edit-profile-image-wrapper']}>
                    <img
                      alt="Profile image"
                      className={styles['sx-edit-profile-image']}
                      id="editProfileImage"
                      src="https://m.media-amazon.com/images/G/01/IdentityAvatarService/Prod/DefaultAvatars/identity-avatar-head-n-shoulder-default-299BD1.png"
                    />
                    <div className={styles['sx-change-avatar-link-wrapper']}>
                      <label>
                        <button className={styles['sx-change-avatar-button']}>
                          <span className={`${styles['sx-a-size-base-plus']} ${styles['sx-a-color-link']} ${styles['sx-change-avatar-link']} ${styles['sx-a-text-normal']}`}>
                            Change profile photo
                          </span>
                        </button>
                        <input
                          accept="image/*"
                          className={styles['sx-aok-hidden']}
                          data-testid="photo-uploader"
                          id="profile-preferences-avatar-upload-id"
                          type="file"
                        />
                      </label>
                    </div>
                  </div>
                  <form>
                    <input
                      aria-label="Text input which lets you update your profile's name"
                      defaultValue=""
                      id="editProfileNameInputId"
                      maxLength={50}
                      type="text"
                    />
                    <span className={styles['sx-edit-error']} id="editError" />
                    <div className={`${styles['sx-a-row']} ${styles['sx-edit-profile-buttons']}`}>
                      <div className={`${styles['sx-a-column']} ${styles['sx-a-span4']}`}>
                        <button className={styles['sx-edit-profile-cancel-button-wrapper']}>
                          <span
                            className={styles['sx-edit-profile-cancel-button']}
                            id="editProfileCancelButton">
                            Cancel
                          </span>
                        </button>
                      </div>
                      <div className={`${styles['sx-a-column']} ${styles['sx-a-span4']} ${styles['sx-a-span-last']}`}>
                        <span
                          className={`${styles['sx-button']} ${styles['sx-button-primary']} ${styles['sx-edit-profile-continue-button']}`}
                          id="editProfileContinueButton">
                          <span className={styles['sx-button-inner']}>
                            <input
                              aria-labelledby="editProfileContinueButton-announce"
                              className={styles['sx-button-input']}
                              type="submit"
                            />
                            <span
                              aria-hidden="true"
                              className={`${styles['sx-button-text']}`}
                              id="editProfileContinueButton-announce">
                              Continue
                            </span>
                          </span>
                        </span>
                      </div>
                    </div>
                  </form>
                </span>
              </span>
            </div>
            <div className={`${styles['sx-a-section']} ${styles['sx-aok-hidden']}`} id="editProfileBottomSheet" />
          </span>
        </div>
        <a
          className={`${styles['sx-language-of-preference']} ${styles['sx-desktop']}`}
          href="/customer-preferences/edit?ie=UTF8&preferencesReturnUrl=%2Fslc%2Fhub&ref_=ph_lop">
          <span
            aria-label="Choose a language for shopping in Amazon India. The current selection is English (EN)."
            className={`${styles['sx-flag']} ${styles['sx-flag-in']}`}
          />
          <span>EN</span>
        </a>
      </div>

      <div className={styles['sx-profile-hub-content']}>
        <div className={`${styles['sx-program-grid']} ${styles['sx-redesign']}`}>
          <div id="accordionSection">
            <div className={`${styles['sx-context-header']} ${styles['sx-desktop']}`}>
              <div aria-level={1} className={`${styles['sx-primary']} ${styles['sx-desktop']}`} role="heading">
                Your Profile
              </div>
              <div className={`${styles['sx-secondary']} ${styles['sx-desktop']}`}>
                Your profile preferences help us personalise recommendations for you.
              </div>
            </div>

            <div className={`${styles['sx-profile-hub-category']} ${styles['sx-desktop']}`} id="sl_preferences">
              <div aria-level={2} className={`${styles['sx-header']} ${styles['sx-desktop']}`} role="heading">
                <div className={`${styles['sx-title']} ${styles['sx-desktop']}`}>Clothing and Shoes</div>
                <div className={`${styles['sx-subtitle']} ${styles['sx-desktop']}`}>Size, fit and price</div>
              </div>

              <div className={styles['sx-content']}>
                <div className={`${styles['sx-section-header']} ${styles['sx-desktop']}`} id="general-section-header">
                  <div
                    aria-label="About you"
                    aria-level={3}
                    className={`${styles['sx-primary']} ${styles['sx-desktop']}`}
                    role="heading">
                    About you
                  </div>
                </div>

                <div className={styles['sx-profile-hub-attributes-section']}>
                  <div className={styles['sx-profile-hub-attributes-data-list']}>
                    <div id="personal-info">
                      <div className={styles['sx-accordion']} data-orientation="vertical">
                        <div className={`${styles['sx-accordion-item']}`} data-orientation="vertical" data-state="closed">
                          <h3 className={`${styles['sx-accordion-header']}`} data-orientation="vertical" data-state="closed">
                            <button
                              aria-controls="radix-0"
                              aria-expanded={false}
                              className={`${styles['sx-accordion-trigger']} ${styles['sx-desktop']}`}
                              data-orientation="vertical"
                              data-radix-collection-item=""
                              data-state="closed"
                              id="accordion-preferred-department-id"
                              type="button">
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-desktop']}`}>Preferred department</div>
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-preview']} ${styles['sx-desktop']}`}>
                                <span>--</span>
                              </div>
                              <svg aria-hidden="true" className={styles['sx-chevron']} fill="none" height="12" viewBox="0 0 15 12" width="15" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M0.5 3.48303L7.494 11L14.488 3.48303L13.116 2.00903L7.494 8.05103L1.872 2.00903L0.5 3.48303Z" fill="#0F1111" fillRule="evenodd" />
                              </svg>
                            </button>
                          </h3>
                        </div>

                        <div className={`${styles['sx-accordion-item']}`} data-orientation="vertical" data-state="closed">
                          <h3 className={`${styles['sx-accordion-header']}`} data-orientation="vertical" data-state="closed">
                            <button
                              aria-controls="radix-2"
                              aria-expanded={false}
                              className={`${styles['sx-accordion-trigger']} ${styles['sx-desktop']}`}
                              data-orientation="vertical"
                              data-radix-collection-item=""
                              data-state="closed"
                              id="accordion-height-and-weight-id"
                              type="button">
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-desktop']}`}>Height and weight</div>
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-preview']} ${styles['sx-desktop']}`}>
                                <span>--</span>
                              </div>
                              <svg aria-hidden="true" className={styles['sx-chevron']} fill="none" height="12" viewBox="0 0 15 12" width="15" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M0.5 3.48303L7.494 11L14.488 3.48303L13.116 2.00903L7.494 8.05103L1.872 2.00903L0.5 3.48303Z" fill="#0F1111" fillRule="evenodd" />
                              </svg>
                            </button>
                          </h3>
                        </div>

                        <div className={`${styles['sx-accordion-item']}`} data-orientation="vertical" data-state="closed">
                          <h3 className={`${styles['sx-accordion-header']}`} data-orientation="vertical" data-state="closed">
                            <button
                              aria-controls="radix-4"
                              aria-expanded={false}
                              className={`${styles['sx-accordion-trigger']} ${styles['sx-desktop']}`}
                              data-orientation="vertical"
                              data-radix-collection-item=""
                              data-state="closed"
                              id="accordion-age-group-id"
                              type="button">
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-desktop']}`}>Age group</div>
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-preview']} ${styles['sx-desktop']}`}>
                                <span>--</span>
                              </div>
                              <svg aria-hidden="true" className={styles['sx-chevron']} fill="none" height="12" viewBox="0 0 15 12" width="15" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M0.5 3.48303L7.494 11L14.488 3.48303L13.116 2.00903L7.494 8.05103L1.872 2.00903L0.5 3.48303Z" fill="#0F1111" fillRule="evenodd" />
                              </svg>
                            </button>
                          </h3>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>


                <div className={`${styles['sx-section-header']} ${styles['sx-desktop']}`} id="sl_preferences-section-header">
                  <div aria-label="Department preferences" aria-level={3} className={`${styles['sx-primary']} ${styles['sx-desktop']}`} role="heading">
                    Department preferences
                  </div>
                  <div className={styles['sx-secondary'] + ' ' + styles['sx-desktop']}>
                    Share preferences for each department to get improved recommendations when you shop there.
                  </div>
                </div>

                <div className={styles['sx-profile-hub-attributes-section']}>
                  <div className={styles['sx-profile-hub-attributes-data-list']}>
                    <div id="preferences">
                      <div className={styles['sx-filters-container']} role="tablist">
                        <button aria-selected="false" className={styles['sx-filter-pill']} role="tab">Women's</button>
                        <button aria-selected="true" className={`${styles['sx-filter-pill']} ${styles['sx-selected']}`} role="tab">Men's</button>
                      </div>
                      <div aria-labelledby="cpp-view-filter-department-mens-tab" className={styles['sx-accordion']} data-orientation="vertical" role="tabpanel">
                        <div className={styles['sx-accordion-item']} data-orientation="vertical" data-state="closed">
                          <h3 className={styles['sx-accordion-header']}>
                            <button className={`${styles['sx-accordion-trigger']} ${styles['sx-desktop']}`} type="button">
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-desktop']}`}>Fit attributes</div>
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-preview']} ${styles['sx-desktop']}`}><span>--</span></div>
                              <svg aria-hidden="true" className={styles['sx-chevron']} fill="none" height="12" viewBox="0 0 15 12" width="15" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M0.5 3.48303L7.494 11L14.488 3.48303L13.116 2.00903L7.494 8.05103L1.872 2.00903L0.5 3.48303Z" fill="#0F1111" fillRule="evenodd" />
                              </svg>
                            </button>
                          </h3>
                        </div>
                        <div className={styles['sx-accordion-item']} data-orientation="vertical" data-state="closed">
                          <h3 className={styles['sx-accordion-header']}>
                            <button className={`${styles['sx-accordion-trigger']} ${styles['sx-desktop']}`} type="button">
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-desktop']}`}>Shoes</div>
                              <div className={`${styles['sx-accordion-trigger-content']} ${styles['sx-preview']} ${styles['sx-desktop']}`}><span>--</span></div>
                              <svg aria-hidden="true" className={styles['sx-chevron']} fill="none" height="12" viewBox="0 0 15 12" width="15" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M0.5 3.48303L7.494 11L14.488 3.48303L13.116 2.00903L7.494 8.05103L1.872 2.00903L0.5 3.48303Z" fill="#0F1111" fillRule="evenodd" />
                              </svg>
                            </button>
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests Section */}
                <div style={{ margin: '24px 0 0 0' }}>
                  <div style={{ border: '1px solid #d5d9d9', borderRadius: 4, display: 'flex', alignItems: 'center', padding: '16px', marginBottom: 8, background: '#f7fafa' }}>
                    <span style={{ fontWeight: 700, fontSize: 20, marginRight: 16 }}>Interests</span>
                    <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, background: 'transparent' }} placeholder="Activities and hobbies" />
                  </div>
                </div>

                <div className={styles['sx-pill-drawer']} role="group">
                  <div className={styles['sx-pill-drawer-label']}>
                    <div className={`${styles['sx-inline-header']} ${styles['sx-desktop']}`} id="suggested-interests-section-header">
                      <div aria-label="Suggested interests" aria-level={3} className={`${styles['sx-primary']} ${styles['sx-desktop']}`} role="heading">Suggested interests</div>
                      <div className={styles['sx-mako-description'] + ' ' + styles['sx-desktop']}>Based on your Amazon activity and popular interests. Select to get personalised recommendations</div>
                    </div>
                  </div>
                  <ul className={styles['sx-pill-drawer-content']}>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Skin Care</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Interior Design</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Storage & Organization</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Dorm Essentials</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Hair Care and Styling</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Babies and Toddlers</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Women's Attire</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Men's Attire</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Baking</button></li>
                    <li><button className={styles['sx-pill-container']}><span style={{fontWeight:600,marginRight:4}}>+</span>Makeup</button></li>
                  </ul>
                </div>

                <div style={{marginTop:12}}>
                  <button style={{background:'#ffd814',border:'1px solid #ffd814',borderRadius:100,padding:'2px 18px',fontWeight:400,fontSize:15,color:'#0f1111',boxShadow:'0 2px 5px 0 rgba(213,217,217,0.5)'}}>Save</button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <div className={styles['sx-footer-container']} />

    </div>
  );
};

export default ProfileSection;
           