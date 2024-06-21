
const { db_connect } = require('./db_connection');

async function parsePriority(agent, priority) {

    const department_id = await parseUserID(agent);

    const res = await db_connect.query(`SELECT id FROM department_priorities WHERE department_id = ${department_id.department_id} AND status = 43 AND name = '${priority}' ORDER BY name ASC`);
    return res.rows[0].id;
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


function parseCatGroupID(status) {
    const mappings = [
        { substring: 'Acct', value: 1 },
        { substring: 'AFF', value: 2 },
        { substring: 'Dep', value: 3 },
        { substring: 'Game', value: 4 },
        { substring: 'WD', value: 5 },
        { substring: 'Bonus', value: 6 },
        { substring: 'Tech', value: 7 },
        { substring: 'Feed', value: 8 },
    ];

    for (const mapping of mappings) {
        if (status.includes(mapping.substring)) {
            return status.includes(mapping.substring) ? mapping.value : null;
        }
    }

}

async function parseDepartmentStatus(status) {
    const cat_group_id = parseCatGroupID(status);
    const res = await db_connect.query(`select id from department_statuses where cat_group_id = ${cat_group_id} and status_name = 'Pending';`);
    return res.rows[0].id;
}

async function parseUserID(username) {
    const res = await db_connect.query(`select id,department_id from users where username = '${username}'`);
    return res.rows[0];
}

async function parseAssignee(assignee) {
    const res = await db_connect.query(`select id from roles where status = 1 and "name" = '${assignee}';`);
    return res.rows[0].id;
}

async function parseCategories(issue, currency, channel) {

    const cat_group_id = parseCatGroupID(issue);
    const issue_id = await db_connect.query(`select ci.id from category_items ci left join  category_holder ch ON ci.cat_holder_id = ch.id where ch.cat_group_id = ${cat_group_id} and ch.label = 'Issue' and ci.status = 43 and ci.name ilike '%${extractRelevantPart(issue)}%';`);
    const currency_id = await db_connect.query(`select ci.id from category_items ci left join  category_holder ch ON ci.cat_holder_id = ch.id where ch.cat_group_id = ${cat_group_id} and ch.label = 'Currency' and ci.status = 43 and ci.name = '${currency}';`);
    const channel_id = await db_connect.query(` select ci.id from category_items ci left join  category_holder ch ON ci.cat_holder_id = ch.id where ch.cat_group_id = ${cat_group_id} and ch.label = 'Channel' and ci.status = 43 and ci.name = '${channel}';`);

    return `${issue_id.rows[0].id},${currency_id.rows[0].id},${channel_id.rows[0].id}`;

}


// Function to extract relevant part of the string
function extractRelevantPart(value) {
    const parts = value.split(' - ');
    return parts.length > 1 ? parts[1] : value;
}

module.exports = function () {
    this.parsePriority = parsePriority;
    this.parseMarket = parseMarket;
    this.parseBrand = parseBrand;
    this.parseCatGroupID = parseCatGroupID;
    this.parseDepartmentStatus = parseDepartmentStatus;
    this.parseUserID = parseUserID;
    this.parseAssignee = parseAssignee;
    this.parseCategories = parseCategories;


}