export const copyToClipboard = (text) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "-1000px";
    textArea.style.left = "-1000px";
    textArea.style.position = "absolute";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    var result;

    try {
        result = document.execCommand('copy');
    } catch (err) {
        result = false;
    }

    document.body.removeChild(textArea);

    return result;
};

export const getOnlyNumbers = (text) => {
    if (!text) {
        return "";
    }

    const numberPattern = /\d+/g;

    return text.match(numberPattern).join('');
};

export const formatPhoneNumber = (text) => {
    const match = text.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }

    return null;
};

export const cropText = (str, length) => {
    return str.length > length ? str.substring(0, length).concat('...') : str
}