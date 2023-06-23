const { checkPayment } = require("../blockchainScripts/checkPayments");

const ClientPayment = require("../database/models/clientPayments");

async function checkAndUpdatePayment(
    blockNum,
    targetAmount,
    clientAddress,
    funcCalling
) {
    try {
        const payed = checkPayment(blockNum, targetAmount, clientAddress);

        // If indeed there is a valid blockchain payment. Check in out DB if it hasn't been used yet.
        if (payed) {
            const clientPayment = await ClientPayment.findOne({
                clientAddress,
                blockNum,
                targetAmount,
                funcCalling,
            });

            if (clientPayment) {
                // Payment found in database, that means it has already been used.
                return !payed;
            } else {
                // Payment not found in database, that means valid payment and now we store it in database so it's registered.
                const clientPayment = new ClientPayment({
                    clientAddress,
                    blockNum,
                    targetAmount,
                    funcCalling,
                });
                await clientPayment.save();
                return payed;
            }
        }
        // Payement is not even in the blockchain, false is returned.
        return payed;
    } catch (err) {
        throw err;
    }
}

module.exports = { checkAndUpdatePayment };
