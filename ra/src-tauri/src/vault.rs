/// Serket's Vault — AES-256-GCM encryption helpers + in-memory key state.
///
/// Key derivation: PBKDF2-HMAC-SHA256, 100 000 rounds, 16-byte random salt.
/// Encryption:     AES-256-GCM, 12-byte random nonce per ciphertext.
/// Storage:        salt, check-blob nonce+ciphertext in `vault_meta`; per-credential
///                 nonce+ciphertext in `credentials`.  All binary values are hex-encoded.
use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use pbkdf2::pbkdf2_hmac;
use rand::RngCore;
use sha2::Sha256;
use std::sync::Mutex;

const PBKDF2_ROUNDS: u32 = 100_000;
const CHECK_PLAINTEXT: &[u8] = b"SERKET_VAULT_V1_OK";

// ── In-memory vault state ─────────────────────────────────────────────────────

/// Holds the 32-byte AES key while the vault is unlocked.  Cleared on lock.
pub struct VaultState(pub Mutex<Option<[u8; 32]>>);

impl VaultState {
    pub fn new() -> Self {
        Self(Mutex::new(None))
    }

    pub fn is_unlocked(&self) -> bool {
        self.0.lock().unwrap().is_some()
    }

    pub fn set_key(&self, key: [u8; 32]) {
        *self.0.lock().unwrap() = Some(key);
    }

    pub fn clear_key(&self) {
        *self.0.lock().unwrap() = None;
    }

    /// Encrypt a plaintext string.  Returns (ciphertext_hex, nonce_hex).
    pub fn encrypt(&self, plaintext: &str) -> Result<(String, String), String> {
        let guard = self.0.lock().unwrap();
        let key = guard.as_ref().ok_or("Vault is locked")?;
        encrypt_with_key(key, plaintext.as_bytes())
    }

    /// Decrypt a (ciphertext_hex, nonce_hex) pair back to a UTF-8 string.
    pub fn decrypt(&self, enc_hex: &str, nonce_hex: &str) -> Result<String, String> {
        let guard = self.0.lock().unwrap();
        let key = guard.as_ref().ok_or("Vault is locked")?;
        decrypt_with_key(key, enc_hex, nonce_hex)
    }
}

// ── Pure crypto helpers ───────────────────────────────────────────────────────

pub fn derive_key(password: &str, salt: &[u8]) -> [u8; 32] {
    let mut key = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, PBKDF2_ROUNDS, &mut key);
    key
}

pub fn generate_salt() -> [u8; 16] {
    let mut salt = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt);
    salt
}

/// Encrypt arbitrary bytes.  Returns (ciphertext_hex, nonce_hex).
pub fn encrypt_with_key(key: &[u8; 32], plaintext: &[u8]) -> Result<(String, String), String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);
    let ciphertext = cipher
        .encrypt(&nonce, plaintext)
        .map_err(|e| e.to_string())?;
    Ok((hex::encode(ciphertext), hex::encode(nonce.as_slice())))
}

fn decrypt_with_key(key: &[u8; 32], enc_hex: &str, nonce_hex: &str) -> Result<String, String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| e.to_string())?;
    let ciphertext = hex::decode(enc_hex).map_err(|e| e.to_string())?;
    let nonce_bytes = hex::decode(nonce_hex).map_err(|e| e.to_string())?;
    if nonce_bytes.len() != 12 {
        return Err("Invalid nonce length".into());
    }
    let nonce = Nonce::from_slice(&nonce_bytes);
    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| "Decryption failed — wrong master password or corrupted data".to_string())?;
    String::from_utf8(plaintext).map_err(|e| e.to_string())
}

/// Encrypt the known check string and return (blob_hex, nonce_hex).
pub fn make_check_blob(key: &[u8; 32]) -> Result<(String, String), String> {
    encrypt_with_key(key, CHECK_PLAINTEXT)
}

/// Returns true only if decrypting the blob produces the known check string.
pub fn verify_check_blob(key: &[u8; 32], blob_hex: &str, nonce_hex: &str) -> bool {
    match decrypt_with_key(key, blob_hex, nonce_hex) {
        Ok(s) => s.as_bytes() == CHECK_PLAINTEXT,
        Err(_) => false,
    }
}
