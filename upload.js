const axios = require('axios');
const https = require('https');
const Helper = require('./class-helper');
const HelperClass = new Helper();
const vitruvian = require('./vitruvian-api');
const _vitruvian = new vitruvian();

uploadToNimbus = async (_req, _res) => {
    const playerclassification = await _vitruvian.vitruvianRequest(_req.body.playerToken);
    const userid = await HelperClass.parseUserID(_req.body.agent);
    const categories = await HelperClass.parseCategories(_req.body.issue, _req.body.currency, _req.body.channel);
    let data = JSON.stringify({
        "categories": `${categories}`, // done
        "userid": userid.id, // done
        "description": `<p>${_req.body.forCMT}</p>`,  // done
        "priority": await HelperClass.parsePriority(_req.body.agent, _req.body.priority),  // done
        "status": await HelperClass.parseDepartmentStatus(_req.body.issue), // done
        "market": HelperClass.parseMarket(_req.body.market),  // done
        "playertoken": _req.body.playerToken,  // done
        "subject": "undefined", // done
        "cat_group_id": HelperClass.parseCatGroupID(_req.body.issue), // done
        "assignee": await HelperClass.parseAssignee(_req.body.assignee), // done
        "watchers": null, // done
        "brand": HelperClass.parseBrand(_req.body.brand),  // done
        "due_date": null, // done
        "playerclassification": playerclassification, // done
        "department_id": userid.department_id, // done
        "email": null, // done
        "internal_note": null, // done
        "userid_to_tag": _req.body.playerToken, // done
        "payment_method": null, // done
        "cashier_id": null // done
    });

    console.log(data);


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