
const jd_get = async (request_uri) => {
   try{
       const result = await fetch(`${process.env.JD_HOST}${request_uri}`, {
           method: "GET",
           headers: {
               'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
               'Content-Type': 'application/json'
           }
       });

       if(result.ok) {
           return await result.json();
       }

       return false;

   } catch(e){
       return false;
   }
}

const jd_post = async (request_uri, data) => {
    return await fetch(`${process.env.JD_HOST}${request_uri}`, {
        method: "POST",
        headers: {
            'Authorization': "Basic " + btoa(process.env.JD_ACCOUNT),
            'Content-Type': 'application/json'
        },
        body: data
    });
}
