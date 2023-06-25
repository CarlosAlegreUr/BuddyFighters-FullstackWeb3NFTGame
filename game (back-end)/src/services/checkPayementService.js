const { checkPayment } = require("../blockchainScripts/checkPayments");

const ClientPayment = require("../database/models/clientPaymentModel");

async function checkAndUpdatePayment(blockNum, targetAmount, clientAddress) {
    try {
        const payed = await checkPayment(blockNum, targetAmount, clientAddress);
        // If indeed there is a valid blockchain payment. Check in out DB if it hasn't been used yet.
        if (payed) {
            const changedUri = false;
            const clientPayment = await ClientPayment.findOne({
                address: clientAddress,
                block: blockNum,
                quantity: targetAmount,
                changedUri: changedUri,
            });

            if (clientPayment) {
                // Payment found in database, that means it has already been used.
                return !payed;
            } else {
                // Payment not found in database, that means valid payment and now we store it in database so it's registered.
                const clientPayment = new ClientPayment({
                    address: clientAddress,
                    block: blockNum,
                    quantity: targetAmount,
                    changedUri: changedUri,
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

async function checkPaymentDb(blockNum, targetAmount, clientAddress) {
    try {
        let changedUri = false;

        const clientPayment = await ClientPayment.findOne({
            address: clientAddress,
            block: blockNum,
            quantity: targetAmount,
            changedUri: changedUri,
        });

        if (clientPayment) {
            clientPayment.changedUri = true;
            await clientPayment.save();
            return true;
        } else {
            return false;
        }
    } catch (err) {
        throw err;
    }
}

module.exports = { checkAndUpdatePayment, checkPaymentDb };
