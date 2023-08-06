async function formatReturn(success, message) {
    const result = await { success: success, message: message };
    return result;
}

module.exports = {
    formatReturn,
};
