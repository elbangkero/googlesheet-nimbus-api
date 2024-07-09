
const { db_connect } = require('./db_connection');

async function parsePriority(agent, priority) {

    const department_id = await parseUserID(agent);

    const errorAgent = {
        webStatus: 'Error',
        message: 'Error on Agent cell',
        columnName: 'agent'
    }

    const errorPriority = {
        webStatus: 'Error',
        message: 'Error on Priority cell',
        columnName: 'priority'
    }
    if (department_id.webStatus === 'Error') {
        return errorAgent;
    }

    const res = await db_connect.query(`SELECT id FROM department_priorities WHERE department_id = ${department_id.department_id} AND status = 43 AND name = '${priority}' ORDER BY name ASC`);
    return res.rows.length === 0 ? errorPriority : res.rows[0].id;
}

async function parseMarket(market) {
    const marketMap = {
        'General': 75,
        'India': 68,
        'Japan': 19,
        'Malaysia': 3,
        'Thailand': 7,
        'Vietnam': 17
    };

    const errorMarket = {
        webStatus: 'Error',
        message: 'Error on Market cell',
        columnName: 'market'
    }

    return marketMap.hasOwnProperty(market) ? marketMap[market] : errorMarket;

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
    const errorIssue = {
        webStatus: 'Error',
        message: 'Error on Issue cell',
        columnName: 'issue'
    };

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
            return mapping.value;
        }
    }

    return errorIssue;
}

async function parseDepartmentStatus(status) {
    const cat_group_id = parseCatGroupID(status);

    if (cat_group_id.webStatus === 'Error') {
        return cat_group_id;
    }
    const res = await db_connect.query(`select id from department_statuses where cat_group_id = ${cat_group_id} and status_name = 'Pending';`);
    return res.rows[0].id;
}

async function parseUserID(username) {
    const response = {
        webStatus: 'Error',
        message: 'Error on Agent cell',
        columnName: 'agent'
    }
    const res = await db_connect.query(`select id,department_id from users where username = '${username}'`);
    return res.rows.length === 0 ? response : res.rows[0];
}

async function parseAssignee(assignee) {
    const errorAssignee = {
        webStatus: 'Error',
        message: 'Error on Assignee cell',
        columnName: 'assignee'
    }
    const res = await db_connect.query(`select id from roles where status = 1 and "name" = '${assignee}';`);

    return res.rows.length === 0 ? errorAssignee : res.rows[0].id;
}

async function parseCategories(issue, currency, channel) {

    const errorIssue = {
        webStatus: 'Error',
        message: 'Error on Issue cell',
        columnName: 'issue'
    }
    const errorCurrency = {
        webStatus: 'Error',
        message: 'Error on Currency cell',
        columnName: 'currency'
    }
    const errorChannel = {
        webStatus: 'Error',
        message: 'Error on Channel cell',
        columnName: 'channel'
    }

    const cat_group_id = parseCatGroupID(issue);

    if (cat_group_id.webStatus === 'Error') {
        return cat_group_id;
    }
    const issue_id = await db_connect.query(`select ci.id from category_items ci left join  category_holder ch ON ci.cat_holder_id = ch.id where ch.cat_group_id = ${cat_group_id} and ch.label = 'Issue' and ci.status = 43 and ci.name ilike '%${extractRelevantPart(issue).trim()}%';`);
    const currency_id = await db_connect.query(`select ci.id from category_items ci left join  category_holder ch ON ci.cat_holder_id = ch.id where ch.cat_group_id = ${cat_group_id} and ch.label = 'Currency' and ci.status = 43 and ci.name = '${currency}';`);
    const channel_id = await db_connect.query(` select ci.id from category_items ci left join  category_holder ch ON ci.cat_holder_id = ch.id where ch.cat_group_id = ${cat_group_id} and ch.label = 'Channel' and ci.status = 43 and ci.name = '${channel}';`);

    if (issue_id.rows.length === 0) {
        return errorIssue
    }
    if (currency_id.rows.length === 0) {
        return errorCurrency
    }
    if (channel_id.rows.length === 0) {
        return errorChannel
    }
    return (currency && channel) ? `${issue_id.rows[0].id},${currency_id.rows[0].id},${channel_id.rows[0].id}` : false;

}


// Function to extract relevant part of the string
function extractRelevantPart(value) {
    const parts = value.split(' - ');
    return parts.length > 1 ? parts[1] : value;
}

async function parsePaymentMethod(payment_method, issue) {

    const cat_group_id = parseCatGroupID(issue);

    const errorPaymentMethod = {
        webStatus: 'Error',
        message: 'Error on Payment Method cell',
        columnName: 'paymentMethod'
    }

    if (cat_group_id.webStatus === 'Error') {
        return cat_group_id;
    }

    if (payment_method == '' || payment_method == undefined || payment_method == null) {
        return null;
    }
    const payment_method_str = String(payment_method).trim();

    const res = await db_connect.query(`SELECT id FROM payment_methods pm WHERE status = 43 AND category_id = ${cat_group_id} AND name = '${payment_method_str}';`);
    return res.rows.length === 0 ? errorPaymentMethod : res.rows[0].id;
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
    this.parsePaymentMethod = parsePaymentMethod;

}