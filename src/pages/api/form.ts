export async function POST({params,request}){
    const response = await fetch(`https://api.web3forms.com/get?access_key=${accessKey}`);
    const json = await response.json();
    return json;    
}