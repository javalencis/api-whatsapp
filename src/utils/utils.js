export function removeCountryCode(phoneNumber) {
    if (phoneNumber.startsWith("+57")) {
        return phoneNumber.slice(3);
    }
    return phoneNumber;
}
