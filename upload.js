const axios = require('axios');
const https = require('https');
const Helper = require('./class-helper');
const HelperClass = new Helper();
const vitruvian = require('./vitruvian-api');
const _vitruvian = new vitruvian();

uploadToNimbus = async (_req, _res) => {

    const playerclassification = await _vitruvian.vitruvianRequest(String(_req.body.playerToken).trim());
    const userid = await HelperClass.parseUserID(String(_req.body.agent).trim());
    const priority = await HelperClass.parsePriority(String(_req.body.agent).trim(), String(_req.body.priority).trim());
    const categories = await HelperClass.parseCategories(String(_req.body.issue).trim(), String(_req.body.currency).trim(), String(_req.body.channel).trim());
    const status = await HelperClass.parseDepartmentStatus(String(_req.body.issue).trim());
    const market = await HelperClass.parseMarket(String(_req.body.market).trim());
    const assignee = await HelperClass.parseAssignee(String(_req.body.assignee).trim());
    const payment_method = await HelperClass.parsePaymentMethod(String(_req.body.paymentMethod).trim(), String(_req.body.issue).trim());

    let data = JSON.stringify({
        "categories": categories,
        "userid": userid.id === undefined ? userid : userid.id,
        "description": `<p>${_req.body.description}</p>`,
        "priority": priority,
        "status": status,
        "market": market,
        "playertoken": checkPlayerToken(String(_req.body.playerToken).trim()),
        "subject": "undefined",
        "cat_group_id": HelperClass.parseCatGroupID(String(_req.body.issue).trim()),
        "assignee": assignee,
        "watchers": null,
        "brand": HelperClass.parseBrand(_req.body.brand),
        "due_date": null,
        "playerclassification": playerclassification,
        "department_id": userid.department_id,
        "email": null,
        "internal_note": null,
        "userid_to_tag": checkPlayerToken(String(_req.body.playerToken).trim()),
        "payment_method": payment_method,
        "cashier_id": String(_req.body.cashierID).trim(),
    });
    const webStatus = checkWebStatus(data);
    //console.log(data);



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
        'status': 7,
        'remark': 8,
        'market': 9,
        'priority': 10,
        'currency': 11,
        'channel': 12,
        'paymentMethod': 13,
        'cashierID': 14,
        'assignee': 15,
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