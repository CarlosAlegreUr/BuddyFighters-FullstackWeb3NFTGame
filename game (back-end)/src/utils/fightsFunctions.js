async function generateFightId(p1, p2, nftId1, nftId2) {
    return Buffer.from(
        p1 + p2 + nftId1.toString() + nftId2.toString()
    ).toString("base64");
}

async function calculateDamage(attackp1, defensep2) {
    const baseDamage = 10;
    let finalDamage = (attackp1 - defensep2) * baseDamage;
    if (finalDamage <= 0) {
        return baseDamage;
    } else return finalDamage;
}

module.exports = { generateFightId, calculateDamage };
