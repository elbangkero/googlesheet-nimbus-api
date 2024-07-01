const axios = require('axios');
const https = require('https');
const Helper = require('./class-helper');
const HelperClass = new Helper();
const vitruvian = require('./vitruvian-api');
const _vitruvian = new vitruvian();

uploadToNimbus = async (_req, _res) => {

    const playerclassification = await _vitruvian.vitruvianRequest(_req.body.playerToken);
    const userid = await HelperClass.parseUserID(_req.body.agent);
    const priority = await HelperClass.parsePriority(_req.body.agent, _req.body.priority);
    const categories = await HelperClass.parseCategories(_req.body.issue, _req.body.currency, _req.body.channel);
    const status = await HelperClass.parseDepartmentStatus(_req.body.issue);
    const market = await HelperClass.parseMarket(_req.body.market);
    const assignee = await HelperClass.parseAssignee(_req.body.assignee);

    let data = JSON.stringify({
        "categories": categories,
        "userid": userid.id === undefined ? userid : userid.id,
        "description": `<p>${_req.body.forCMT}</p>`,
        "priority": priority,
        "status": status,
        "market": market,
        "playertoken": checkPlayerToken(_req.body.playerToken),
        "subject": "undefined",
        "cat_group_id": HelperClass.parseCatGroupID(_req.body.issue),
        "assignee": assignee,
        "watchers": null,
        "brand": HelperClass.parseBrand(_req.body.brand),
        "due_date": null,
        "playerclassification": playerclassification,
        "department_id": userid.department_id,
        "email": null,
        "internal_note": null,
        "userid_to_tag": checkPlayerToken(_req.body.playerToken),
        "payment_method": null,
        "cashier_id": null
    });
    const webStatus = checkWebStatus(data);
    console.log(data);



    if (webStatus.status === 'Success') {
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.NIMBUS_PRD_URL}/api/crm/storeticket/googlesheet`,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': 'elportal_session=eyJpdiI6IlQwbjhPWnY2UG9PdzJ3ZHFJbkNPT1E9PSIsInZhbHVlIjoiWUdTakpvbHpFXC9WYmVIOE9HV2xXZjJzZWdrd3NtRDlmdE9ob09WTExhOE1oWGZQNkliNXVLYitZWWQyaXAxcXQiLCJtYWMiOiI3Y2I0NWM5ZWMxNzNhOTQzZDg5ZDk0YjIwNDE3YmVlZTJlNjVkM2RmMjgzYmIyOWI0ZTllMjBmNjk3NDk2OTIyIn0%3D'
            },
            data: data,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        };

        axios.request(config)
            .then((response) => {
                const resData = {
                    rowNumber: _req.body.rowNumber,
                    webStatus: 'Done'
                }
                console.log({ 'statusCode': 200, 'status': true, message: 'Nimbus Google Sheet API received the request', 'callback': resData });
                _res.status(200).json({ 'statusCode': 200, 'status': true, message: 'Nimbus Google Sheet API received the request', 'callback': resData });
            })
            .catch((error) => {
                const resData = {
                    rowNumber: _req.body.rowNumber,
                    webStatus: 'Error'
                }
                console.log({ 'statusCode': 500, 'status': true, message: 'Error Request', 'callback': resData });
                _res.status(200).json({ 'statusCode': 500, 'status': true, message: 'Error Request', 'callback': resData });
            });

    }
    else {
        const dataRequest = JSON.parse(data);
        const nestedProperty = dataRequest[webStatus.location];
        nestedProperty.columnNo = csvColumns(nestedProperty.columnName);
        nestedProperty.rowNumber = _req.body.rowNumber;
        _res.status(200).json({ 'statusCode': 500, 'status': true, message: 'Error Request', 'callback': nestedProperty });
    }

}
function csvColumns(columnName) {
    const columnMap = {
        'date': 1,
        'playerToken': 2,
        'categoryGroup': 3,
        'issue': 4,
        'agent': 5,
        'description': 6,
        'forCMT': 7,
        'status': 8,
        'remark': 9,
        'market': 10,
        'priority': 11,
        'currency': 12,
        'channel': 13,
        'assignee': 14,
    };

    return columnMap.hasOwnProperty(columnName) ? columnMap[columnName] : null;
}
function checkWebStatus(obj) {
    if (typeof obj === 'string') {
        try {
            obj = JSON.parse(obj);
        } catch (e) {
            console.error("Failed to parse JSON string:", e);
            return { status: "Error", location: "JSON parsing" };
        }
    }

    function checkObject(o, path = '') {
        for (const key in o) {
            const currentPath = path ? `${path}.${key}` : key;
            if (typeof o[key] === 'object' && o[key] !== null) {
                if (o[key].webStatus === "Error") {
                    return { status: "Error", location: currentPath };
                }
                const result = checkObject(o[key], currentPath);
                if (result.status === "Error") {
                    return result;
                }
            }
        }
        return { status: "Success", location: null };
    }

    return checkObject(obj);
}


function checkPlayerToken(playertoken) {

    if (playertoken === '' || playertoken == undefined) {
        const errorToken = {
            webStatus: 'Error',
            message: 'Error on PlayerToken cell',
            columnName: 'playerToken'
        }
        return errorToken;
    }
    return playertoken;
}


module.exports = function (app) {
    app.post('/nimbus-upload', uploadToNimbus);

};