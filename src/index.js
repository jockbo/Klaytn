import Caver from "caver-js";

const config ={
  rpcURL: 'https://api.baobab.klaytn.net:8561'
}
const cav = new Caver(config.rpcURL);
const agContract = new cav.klay.Contract(DEPLOYED_ABI, DEPLOYED_ADDRESS);
const App = {
  auth: {
    accessType: 'keystore', //Authentication method->keystore type
    keystore: '',//keystore save
    password: ''//password with keystore file
  },
  start: async function () {
    const walletFromSession = sessionStorage.getItem('walletInstance');
    if (walletFromSession){
      try{
        cav.klay.accounts.wallet.add(JSON.parse(walletFromSession));
        this.changeUI(JSON.parse(walletFromSession));
      }catch(e){
        sessionStorage.removeItem('walletInstance');
      }
    }
  },

  handleImport: async function () {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);
    fileReader.onload = (event) => {
      try {
        if(!this.checkValidKeystore(event.target.result)){
          $('#message').text('Not invalid keystore file');
          return;
        }
        this.auth.keystore = event.target.result;
        $('#message').text('keystore pass, enter password');
        document.querySelector('#input-password').focus();
      }catch(event){
        $('#message').text('Not invalid keystore file');
        return;
      }
    }
  },//keystore Authentication

  handlePassword: async function () {
    this.auth.password = event.target.value;
  },

  handleLogin: async function () {
    if(this.auth.accessType === 'keystore'){
      try {
        const privateKey = cav.klay.accounts.decrypt(this.auth.keystore, this.auth.password).privateKey;
        this.integrateWallet(privateKey);
      }catch(e){
        $('#message').text('Not invalid password');
      }
    }
  },

  handleLogout: async function () {
    this.removeWallet();
    location.reload();
  },

  generateNumbers: async function () {

  },

  submitAnswer: async function () {

  },

  deposit: async function () {
    const walletInstance = this.getWallet();
    if (walletInstance){
      if (await this.callOwner() !== walletInstance.address) return;
      else{
        var amount = $('#amount').val();
        if (amount){
           agContract.methods.deposit().send({
            from: walletInstance.address,//who is call this function
            gas: '250000',
            value: cav.utils.toPeb(amount, "KLAY")
          })
          .once('transactionHash', (txHash) =>{
            console.log(`txHash: ${txHash}`);
          })//print transaction
          .once('receipt',(receipt) => {
            console.log(`(#${receipt.blockNumber})`, receipt);
          })//print receipt
          .once('error', (error) => {
            alert(error.message);//error message
          });
        }
        return;
      }
    }
  },

  callOwner: async function () {
    return await agContract.methods.owner().call();
  },

  callContractBalance: async function () {

  },

  getWallet: function () {
    if (cav.klay.accounts.wallet.length){
      return cav.klay.accounts.wallet[0];//first account of Login accounts
    }
  },

  checkValidKeystore: function (keystore) {
    const parsedKeystore = JSON.parse(keystore);//keystore file convert to js object
    const isValidKeystore = parsedKeystore.version &&
      parsedKeystore.id &&
      parsedKeystore.address &&
      parsedKeystore.crypto;//check version,id,address,crypto in keystore

    return isValidKeystore

  },

  integrateWallet: function (privateKey) {
    const walletInstance = cav.klay.accounts.privateKeyToAccount(privateKey);
    cav.klay.accounts.wallet.add(walletInstance)
    sessionStorage.setItem('walletInstance', JSON.stringify(walletInstance));
    this.changeUI(walletInstance);
  },//account authentication

  reset: function () {
    this.auth = {
      keysotre: '',
      password: ''
    };
  },

  changeUI: async function (walletInstance) {
    $('#loginModal').modal('hide');//modal hide
    $('#login').hide();//login hide
    $('#logout').show();
    $('#address').append('<br>'+ '<p>' +'my account address: '+ walletInstance.address + '</p>');//
  },

  removeWallet: function () {
    cav.klay.accounts.wallet.clear();
    sessionStorage.removeItem('walletInstance');
    this.reset();
  },

  showTimer: function () {

  },

  showSpinner: function () {

  },

  receiveKlay: function () {

  }
};

window.App = App;

window.addEventListener("load", function () {
  App.start();
});

