
const levers = document.querySelectorAll('.lever');
const lamps = document.querySelectorAll('.lampFlash');

var socket = new WebSocket("ws://178.20.156.145:3000");



const massOfLever = [false, false, false, false]
const currentLever = 0;
var checkedLever = 1;
var stFlag = true;

const sendCompareQuery = (lever1, lever2, stateId) => {
  const query = {
    action: 'check',
    lever1,
    lever2,
    stateId,
  }

  socket.send(JSON.stringify(query));
}

const sendTurnOffQuery = stateId => {
  const query = {
    action: 'powerOff',
    stateId,
  }

  socket.send(JSON.stringify(query));
}
const turnOfftheLight = () => {
  levers.forEach((item, i) => {
      item.checked = massOfLever[i];
      if(item.checked === true){
        lamps[i].classList.add('light');
      }else{
        lamps[i].classList.remove('light');
      }
})
}

const checkAllSameOrNot = () => massOfLever.every( lever => lever === stFlag );
socket.onopen = () => console.log('Connected');
socket.onclose = () => console.log('Disconnected');


socket.onmessage = event => {
  
  const data = JSON.parse(event.data);
 

  if (data.pulled >= 0) {
    massOfLever[data.pulled] = !massOfLever[data.pulled];
    turnOfftheLight();
    sendCompareQuery(currentLever, checkedLever, data.stateId);
  console.log(data.pulled);
  }

  if (data.newState === 'poweredOn') stFlag = false;

  if (data.newState === 'poweredOff') {
    console.log('Token: ', data.token);
    socket.close();
  }

  if (data.same) {
    massOfLever[checkedLever] = massOfLever[currentLever];
    if (checkedLever < massOfLever.length - 1) checkedLever++;
    if (checkAllSameOrNot()) sendTurnOffQuery(data.stateId);
  }
}
  
 