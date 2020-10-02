
var express=require("express");
var router=express.Router();
const path= require("path")
const readline= require('readline')
const {google} = require('googleapis');

//token json created successfully
const TOKEN_PATH="token.json"

const SCOPES=['https://www.googleapis.com/auth/gmail.readonly','https://www.googleapis.com/auth/gmail.send'];

const fs=require("fs");

//credentials
fs.readFile('credentials.json', (err,content) => {
  authorize(JSON.parse(content)); //authorization
})

let oAuth2Cliet;

function authorize(credentials)
{
  const{client_secret, client_id, redirect_uris}= credentials.installed

  //oauth config
  oAuth2Client=new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

  fs.readFile(TOKEN_PATH, (err, token) =>{
if(err)
return getNewToken(oAuth2Client) //generate new token
oAuth2Client.setCredentials(JSON.parse(token))//set credentials
})

}



//generate new token
function getNewToekn(oAuth2Client)
{
  const authurl=oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })

  console.log('Authorize this app by visiting this url:', authUrl);

  const r1=readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  r1.question("Enter the code from that page here", (code)=>{
    r1.close()

    oAuth2Client.getToken(code, (err,token) =>{
      console.log(err, "----------------$$$");
      oAuth2Client.setCredentials(token);
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err)=>{
        if(err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      })
    })
  })
}


async function sendEmail(auth)
{
  const gmail=google.gmail({version:'v1',auth});

  let encodedMessage='RnfnsfsujhnserHBRWUEIJFNEWIFNWUEnsjfnuefnhdbfor84inffdnbdhbfsdf='

  //send api..
  let email=await gmail.users.messages.send({
    userId:'me',
    resource:
    {
      raw:encodedMessage,
    }
  })
  return email
}


//get Homepage
router.get('/',function(req,res,next){
  res.render('index',{title:'Express'});
});


//send mailapi path
router.get('/sendmail', async(req,res,next)=>
{
  let email=await sendEmail(oAuth2Client)
  res.json({email})
})

module.exports=router;
