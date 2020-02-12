
window.PUZZLE_VERSION = 3; // Version for newly created puzzles

window.EARLIEST_VERSION = 3; // Only allow puzzles with version greater or equal to EARLIEST_VERSION


// format UTC epoch seconds to local timezone
function formatDate(time) {
    var seconds = parseInt(time);
    var d = new Date(0);
    d.setUTCSeconds(seconds);

    return d.toLocaleString();
}


// Remote html tags to prevent XSS
function cleanHtml(string){
    var regex = /(<([^>]+)>)/ig;
    
    return string.replace(regex, "")
}

// Generate passphrase from id and solution
function generateEncryptionKey(id, solution) {
    var sum = "" + id + solution + id + solution + id + "arweave";
    return sha256(sum);
}

// Encrypt the private key
function encryptPrivKey(privKey, encryptionKey) {
    var encoded = btoa(JSON.stringify(privKey))
    return CryptoJS.AES.encrypt(encoded, encryptionKey)
}

// Decrypt the private key
function decryptPrivKey(encryptedPrivKey, encryptionKey) {
    var decrypted = CryptoJS.AES.decrypt(encryptedPrivKey, encryptionKey).toString(CryptoJS.enc.Utf8);
    return JSON.parse(atob(decrypted))
}

// Decode tags from ArWeave transaction object
function decodeTags(txn) {
    var out = {};

    txn.get("tags").forEach((tag) => {
        out[tag.get("name", {decode: true, string: true})] = tag.get("value", {decode: true, string: true});
    });

    return out;
}

// Async filter for array (https://stackoverflow.com/questions/33355528/filtering-an-array-with-a-function-that-returns-a-promise)
async function asyncFilter(array, callback) {
  const fail = Symbol()
  return (await Promise.all(array.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
}








