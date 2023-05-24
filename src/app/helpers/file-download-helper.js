export const downloadFileFromFileResponse = (type, fileResponse) => {
    var a = document.createElement("a");
    a.href = `data:${type};base64,` + fileResponse.data.data.fileBytes;
    a.download = fileResponse.data.data.fileName;
    a.click();
};