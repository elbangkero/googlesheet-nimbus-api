const axios = require('axios');


async function vitruvianRequest(id) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://afun-playerinfo-ap-prod.vitruviandata.com/player?token=${id}`,
        headers: {
            'Authorization': 'Basic bmltYnVzOndeN3FCUCpOJlRaZQ=='
        }
    };

    try {
        const response = await axios(config);
        const result = response.data.results[0].status.segment === ''
            ? response.data.results[0].status.flag
            : response.data.results[0].status.segment;
        return result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}



module.exports = function () {
    this.vitruvianRequest = vitruvianRequest;
}