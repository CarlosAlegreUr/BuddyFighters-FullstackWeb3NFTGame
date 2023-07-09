async function calculateDamage(attackp1, defensep2) {
    const baseDamage = 10;
    let finalDamage = (attackp1 - defensep2) * baseDamage;
    if (finalDamage <= 0) {
        return baseDamage;
    } else return finalDamage;
}

module.exports = { calculateDamage };
