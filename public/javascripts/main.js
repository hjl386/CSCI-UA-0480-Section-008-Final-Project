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


//TodaysMatches.hbs - creates Buttons to be appended to a page
function createButton(context, value, func){
    const button = document.createElement('input');
    button.type = 'button';
    button.value = value;
    button.onclick = func;
    context.appendChild(button);
}

//TodaysMatches.hbs - AJAX injects the selected users information
function getMatches(){
    const req = new XMLHttpRequest();
    let url = 'http://localhost:3000/api/todaysMatches';       //Change the URL to Linserv
    req.open('GET', url, true);
    req.addEventListener('load', function handleReveal(){
        if(req.status >= 200 && req.status < 400){
            const data = JSON.parse(req.responseText);
            const revealPerson = document.getElementById('revealPerson');
            revealPerson.innerHTML = '';
            console.log('DATA GET MATCHES', data);            
            data.forEach((user) => {
                const p = document.createElement('p');
                p.textContent = user.username + ' ' + user.firstname + ' ' + user.lastname;
                revealPerson.appendChild(p);
            });
            //revealPerson.innerHTML = 'It works';
        }
    });
    req.addEventListener('error', function(){
        console.log('ERROR');
    });
    req.send();
}

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
            //p.textContent = data.username + ' ' data.firstname + ' ' data.lastname + ' ' data.swipes;
            let swipe = '';
            if(data.swipes){
                swipe += 'Yep I can swipe you!';
            } else{
                swipe += 'Please swipe me';
            }
            p.textContent = data.username + ' '+ data.firstname + ' ' + data.lastname + ' ' + swipe;
            revealPerson.appendChild(p);
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
