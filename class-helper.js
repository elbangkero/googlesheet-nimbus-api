function parsePriority(priority) {
    const priorityMap = {
        'Low': 31,
        'Normal': 32,
        'Priority 1': 33,
        'Priority 2': 34,
        'Priority 3': 35,
        'Priority 4': 36,
        'VIP': 41
    };

    return priorityMap.hasOwnProperty(priority) ? priorityMap[priority] : null;
}

function parseMarket(market) {
    const marketMap = {
        'General': 75,
        'India': 68,
        'Japan': 19,
        'Malaysia': 3,
        'Thailand': 7,
        'Vietnam': 17
    };

    return marketMap.hasOwnProperty(market) ? marketMap[market] : null;

}

function parseBrand(brand) {
    const data = [
        { id: 100, name: 'Generic' },
        { id: 141, name: 'Hachislot' },
        { id: 126, name: 'HL' }, // HappyLuke
        { id: 158, name: 'Happy Vegas' }, // HappyVegas
        { id: 61, name: 'LCH' }, // Live Casino House
        { id: 61, name: 'Live Casino House' } // Live Casino House
    ];

    const knownSubstrings = {
        'HL': 'HL',
        'Happy Vegas': 'Happy Vegas',
        'LCH': 'LCH',
        'Hachislot': 'Hachislot',
        'Generic': 'Generic',
        'Live Casino House': 'Live Casino House',
    };

    let matchedBrand = null;
    for (const substring in knownSubstrings) {
        if (brand.includes(substring)) {
            matchedBrand = knownSubstrings[substring];
            break;
        }
    }

    if (!matchedBrand) {
        return null;
    }

    const matches = data.filter(item => item.name === matchedBrand);

    const results = matches.map(item => item.id);

    return results.length > 0 ? results[0] : null;
}

module.exports = function () {
    this.parsePriority = parsePriority;
    this.parseMarket = parseMarket;
    this.parseBrand = parseBrand;
}