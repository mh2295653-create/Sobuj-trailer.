/* OrderFlow Manager configuration
   GitHub-safe: no plain-text usernames, passwords, EmailJS IDs, or Gmail credentials are stored here.
   Local demo login is verified by SHA-256 hashes only. */
window.OFM_CONFIG = {
  APP_NAME: 'OrderFlow Manager',
  STORAGE_PREFIX: 'ofm_secure_v3_',
  IMAGE_MAX_MB: 5,
  ARCHIVE_RETENTION_DAYS: 30,
  DEFAULT_ADMIN: {
    nameHash: '51524d439f8a076eec2fa76f3722a706f0993d939436f1d641f426b241621324',
    passHash: 'e31a03fafd1bb07c48defea591220476a9b6836a460e7835f52ba2ed21e46039'
  },
  DEFAULT_STAFF_LIST: [
    { nameHash: 'dadf129b2073a5d83e79bfb9adc0147f760a94e954d3adc41032a895fd6e66aa', passHash: '15fa02e0484777d129539f063722f7751e26be52ef3df6ca12db03ad79b1e6ba' },
    { nameHash: 'cc691b09d6da9bcbeef74715f47b08e93d8ad075f94a3257fe7e33b613742a1a', passHash: 'd4a18ad47f587ef62626acb03f25f52a54bad902f3aca523ba891d11df4d724e' },
    { nameHash: 'dfd0466fbd0ceeebd93be30aa0d8274dccb688c1211f89ea7d94a9188cfa5d8e', passHash: 'b7b2532605584087512d1c1e474c9273f6ba9ba399b81ccf4e698ad8cbd7bc2a' },
    { nameHash: 'b831f135b0e7ec6c7f1c8c4aa6746aef663a7bdb3770c2952c264cf08496c5dd', passHash: '2eefbbaa69760a344d5ec8dbfd7d95d6df0df6b7e57c8d75ecd41db6c7d071d7' },
    { nameHash: '52bfbd170820dafc4be9fb798737532c511f7b5a2cce95ac87dd527797f8250d', passHash: 'dc9448baf7080541ab16889f993c350eb74f65cd571260190c1c008fcdee9577' }
  ]
};
