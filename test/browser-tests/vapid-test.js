/* eslint-env browser,mocha */

'use strict';

describe('Test VAPID', function() {
  // const PAYLOAD = 'Hello, world!';
  const VALID_VAPID_KEYS = {
    publicKey: 'BG3OGHrl3YJ5PHpl0GSqtAAlUPnx1LvwQvFMIc68vhJU6nIkRzPEqtCduQz8wQj0r71NVPzr7ZRk2f-fhsQ5pK8',
    privateKey: 'Dt1CLgQlkiaA-tmCkATyKZeoF1-Gtw1-gdEP6pOCqj4'
  };

  const VALID_OUTPUT = {
    bearer: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJodHRwOi8vbG9jYWxob3N0Ojg4ODgiLCJleHAiOjE0NjQyMjc5NzEsInN1YiI6Im1haWx0bzpzaW1wbGUtcHVzaC1kZW1vQGdhdW50ZmFjZS5jby51ayJ9.R2MxJucajo5LmAd4Duw3v2pWloIlHqztjnQPgF0kiDVtsi_b0ACx-ivS4CxA28roPpGmUlCMCkcwHLdB6IoC_w',
    p256ecdsa: 'BG3OGHrl3YJ5PHpl0GSqtAAlUPnx1LvwQvFMIc68vhJU6nIkRzPEqtCduQz8wQj0r71NVPzr7ZRk2f-fhsQ5pK8'
  };

  it('should be able to generate vapid keys', function() {
    const factory = window.gauntface.EncryptionHelperFactory;
    factory.generateVapidKeys()
    .then(keys => {
      keys.should.not.equal('undefined');
      keys.should.have.property('publicKey');
      keys.should.have.property('privateKey');
    });
  });

  it('should be able to create new Encryption Helper', function() {
    const factory = window.gauntface.EncryptionHelperFactory;
    return factory.generateHelper()
    .then(testEncryption => {
      (typeof testEncryption).should.not.equal('undefined');
    });
  });

  it('should NOT create new vapid certificates if nothing is passed in', function() {
    const factory = window.gauntface.EncryptionHelperFactory;
    return factory.generateHelper()
    .then(testEncryption => {
      (testEncryption.getPublicVapidKey() === null).should.equal(true);
      (testEncryption.getPrivateVapidKey() === null).should.equal(true);
    });
  });

  it('should accept valid input VAPID certificates', function() {
    const factory = window.gauntface.EncryptionHelperFactory;
    const EncryptionHelper = window.gauntface.EncryptionHelper;
    return EncryptionHelper.importKeys(VALID_VAPID_KEYS)
    .then(keys => {
      return factory.generateHelper({
        vapidKeys:
      });
    })
    .then(testEncryption => {
      (testEncryption.getPublicVapidKey() instanceof CryptoKey).should.equal(true);
      (testEncryption.getPrivateVapidKey() instanceof CryptoKey).should.equal(true);
      return EncryptionHelper.exportCryptoKeys(
        testEncryption.getPublicVapidKey(),
        testEncryption.getPrivateVapidKey()
      );
    })
    .then(keys => {
      (keys.publicKey instanceof Uint8Array).should.equal(true);
      (keys.privateKey instanceof Uint8Array).should.equal(true);

      (keys.publicKey.length).should.equal(65);
      (keys.privateKey.length).should.equal(32);

      const publicKey = EncryptionHelper.uint8ArrayToBase64Url(keys.publicKey);
      const privateKey = EncryptionHelper.uint8ArrayToBase64Url(keys.privateKey);
      publicKey.should.equal(VALID_VAPID_KEYS.publicKey);
      privateKey.should.equal(VALID_VAPID_KEYS.privateKey);
    });
  });

  it('should be able to generate VAPID authentication headers', () => {
    const factory = window.gauntface.EncryptionHelperFactory;
    return factory.generateVapidKeys()
    .then(keys => {
      return factory.generateHelper({
        vapidKeys: keys
      });
    })
    .then(testEncryption => {
      return testEncryption.createVapidAuthHeader('http://localhost', 'mailto:simple-push-demo@gauntface.co.uk');
    })
    .then(authHeaders => {
      (authHeaders instanceof Object).should.equal(true);
      (typeof authHeaders.bearer === 'string').should.equal(true);
      (typeof authHeaders.p256ecdsa === 'string').should.equal(true);

      (authHeaders.bearer.length).should.equal(246);
      (authHeaders.p256ecdsa.length).should.equal(87);
    });
  });

  it('should generate specific VAPID authentication headers', () => {
    const factory = window.gauntface.EncryptionHelperFactory;
    return factory.generateHelper({
      vapidKeys: VALID_VAPID_KEYS
    })
    .then(testEncryption => {
      return testEncryption.createVapidAuthHeader('http://localhost:8888', 'mailto:simple-push-demo@gauntface.co.uk', 1464228574);
    })
    .then(authHeaders => {
      (authHeaders instanceof Object).should.equal(true);
      (typeof authHeaders.bearer === 'string').should.equal(true);
      (typeof authHeaders.p256ecdsa === 'string').should.equal(true);

      authHeaders.bearer.indexOf('eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJodHRwOi8vbG9jYWxob3N0Ojg4ODgiLCJleHAiOjE0NjQyMjg1NzQsInN1YiI6Im1haWx0bzpzaW1wbGUtcHVzaC1kZW1vQGdhdW50ZmFjZS5jby51ayJ9').should.equal(0);
      authHeaders.p256ecdsa.should.equal(VALID_OUTPUT.p256ecdsa);
    });
  });
});