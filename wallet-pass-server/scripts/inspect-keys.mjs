import fs from 'node:fs';
import crypto from 'node:crypto';

function keyType(pem) {
  try {
    const k = crypto.createPrivateKey(pem);
    return k.asymmetricKeyType;
  } catch (e) {
    return 'unreadable: ' + e.message;
  }
}

function certInfo(pem) {
  try {
    const c = new crypto.X509Certificate(pem);
    return {
      subject: c.subject,
      issuer: c.issuer,
      publicKeyType: c.publicKey.asymmetricKeyType,
      fingerprint256: c.fingerprint256,
    };
  } catch (e) {
    return { error: e.message };
  }
}

const signerCertPem = fs.readFileSync('certs/pass-cert.pem');
const signerKeyPem = fs.readFileSync('certs/pass-key.pem');
const wwdrPem = fs.readFileSync('certs/wwdr.pem');

const signerCert = certInfo(signerCertPem);
const wwdrCert = certInfo(wwdrPem);
const ktype = keyType(signerKeyPem);

// Check modulus match for RSA keys
let modulusMatch = 'n/a';
try {
  if (signerCert.publicKeyType === 'rsa' && ktype === 'rsa') {
    const pub = signerCertPemToModulus(signerCertPem);
    const pri = privateKeyPemToModulus(signerKeyPem);
    modulusMatch = pub === pri ? 'YES' : 'NO';
  }
} catch {}

console.log(JSON.stringify({ signerCert, wwdrCert, signerKeyType: ktype, rsaModulusMatch: modulusMatch }, null, 2));

function signerCertPemToModulus(pem) {
  const key = crypto.createPublicKey(pem);
  const der = key.export({ type: 'pkcs1', format: 'der' });
  return der.toString('hex').slice(-512); // crude fingerprint of modulus area
}

function privateKeyPemToModulus(pem) {
  const key = crypto.createPrivateKey(pem);
  const der = key.export({ type: 'pkcs1', format: 'der' });
  return der.toString('hex').slice(-512);
}

