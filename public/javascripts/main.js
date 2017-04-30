//Main.js

//Index.hbs - Toggles back and forth the initially hidden login form
function loginToggle(){
	const divLogin = document.getElementById('loginToggle');
	divLogin.style.display = divLogin.style.display === 'none' ? 'block' : 'none';
}

//Index.hbs - Toggles back and forth the initially hidden register form
function registerToggle(){ 
	const divRegister = document.getElementById('registerToggle');
	divRegister.style.display = divRegister.style.display === 'none' ? 'block' : 'none';
}

//Profile.hbs - Toggles back and forth the initially hidden profile edit form 
function editUserInfoToggle(){
	const divProfile = document.getElementById('editUserInfo');
	divProfile.style.display = divProfile.style.display === 'none' ? 'block' : 'none';
}

//TodaysMatches.hbs - If you click yes to match adds to the like array
function yesMatch(data){
    alert('YES');
}

//TodaysMatches.hbs - If you click no to match adds to the dislike array
function noMatch(data){
    alert('NO');
}

//TodaysMatches.hbs - creates Buttons to be appended to a page
//function createButton(value, id){
//    const button = document.createElement('button');
//    button.type = type;
//    button.value = value;
//    button.id = id;
//    button.name = name;
//    context.appendChild(button);
//}

//TodaysMatches.hbs - AJAX injects the selected users information
function revealClickHandler(evt){
    evt.preventDefault();
    const req = new XMLHttpRequest();
    const url = 'http://localhost:3000/api/todaysMatches';
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    const revealRadio = document.getElementsByName('revealRadio');
    const data = {};
    revealRadio.forEach((ele) => {
        if(ele.checked){
            data.username = ele.value;
        }
    });
    console.log('DATA', data);
    req.send(JSON.stringify(data));
    req.addEventListener('load', function(){
        if(req.status >= 200 && req.status < 400){
            const data = JSON.parse(this.responseText);
            const revealPerson = document.getElementById('revealPerson');
            revealPerson.innerHTML = '';
            const p = document.createElement('p');
            let swipe = '';
            if(data.swipes){
                swipe += 'Yep I can swipe you!';
            } else{
                swipe += 'Please swipe me';
            }
            p.textContent = data.username + ' '+ data.firstname + ' ' + data.lastname + ' ' + swipe;
            revealPerson.appendChild(p);
            const yesButton = document.createElement('button');
            yesButton.id = 'yesBtn';
            const likeText = document.createTextNode('Like');
            yesButton.appendChild(likeText);
            yesButton.onclick = function(){ location.href = '/'+data.username;};
            const noButton = document.createElement('button');
            noButton.id = 'noBtn';
            const dislikeText = document.createTextNode('Dislike');
            noButton.appendChild(dislikeText);
            noButton.onclick = function(){ location.href='/'+data.username;};
            revealPerson.appendChild(yesButton);
            revealPerson.appendChild(noButton);
        }
    });
    req.addEventListener('error', function(){
        console.log('ERROR');
    });
}

function main(){
    //TodaysMatches.hbs
    const revealBtn = document.getElementById('revealSubmit');
    revealBtn.addEventListener('click', revealClickHandler);
}

document.addEventListener('DOMContentLoaded', main);
