const axios = require('axios');
const https = require('https');
const Helper = require('./class-helper');
const HelperClass = new Helper();

uploadToNimbus = async (_req, _res) => {

    console.log(_req.body);

    let data = JSON.stringify({
        "categories": "450,136,157",
        "userid": "3",
        "description": `<p>${_req.body.forCMT}</p>`, //Nimbus Description
        "priority": HelperClass.parsePriority(_req.body.priority),
        "status": "35",
        "market": HelperClass.parseMarket(_req.body.market),
        "playertoken": _req.body.playerToken,
        "subject": "undefined",
        "cat_group_id": "7",
        "assignee": "4",
        "watchers": "group_2",
        "brand": HelperClass.parseBrand(_req.body.brand),
        "due_date": null,
        "playerclassification": "test account",
        "department_id": "1",
        "email": null,
        "internal_note": null,
        "userid_to_tag": _req.body.playerToken,
        "payment_method": null,
        "cashier_id": null
    });

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
            console.log({ 'statusCode': 400, 'status': true, message: 'Error Request', 'callback': resData });
            _res.status(200).json({ 'statusCode': 200, 'status': true, message: 'Error Request', 'callback': resData });
        });


}


module.exports = function (app) {
    app.post('/nimbus-upload', uploadToNimbus);

};