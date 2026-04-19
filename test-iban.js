const ibantools = require('ibantools');

const iban = "FR14 2004 1010 0505 0001 3M02 606";
const ibanClean = iban.replace(/\s/g, '').toUpperCase();

console.log(`Original: "${iban}"`);
console.log(`Clean: "${ibanClean}"`);
console.log(`Length: ${ibanClean.length}`);

const isValid = ibantools.isValidIBAN(ibanClean);
console.log(`isValidIBAN: ${isValid}`);

if (!isValid) {
    console.log("Validation failed.");
} else {
    console.log("Validation passed.");
}
