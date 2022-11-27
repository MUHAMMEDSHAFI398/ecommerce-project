const na = document.getElementById('name');
const phone = document.getElementById('phone');
const form = document.getElementById('form');
const email = document.getElementById('email'); 
const password = document.getElementById('password');
const confirmpassword = document.getElementById('conpassword');
//const errorElement = document.getElementById('error')

form.addEventListener('submit',(e)=>{
    let flag = 0;
   // e.preventDefault();
    const namevalue = na.value.trim();
    const emailvalue = email.value.trim();
    const phonevalue = phone.value.trim();
    const passwordvalue = password.value.trim();
    const conpasswordvalue = confirmpassword.value.trim();


if (namevalue === ''){
    setError(na,'Feild is empty','nameerror');
flag = 1;
} else if (!onlyLetters(namevalue)){
    setError(na,'Name should only contain alphabets','nameerror');
    flag=1;
}else {
    setSuccess(na,'nameerror');
    flag=0;
}

if (emailvalue === '') {
    setError(email, 'Field is empty', 'emailerror');
    flag = 1;
} else if (!emailvalidation(emailvalue)) {
    setError(email, 'Email ID is invalid', 'emailerror');
    flag = 1;
} else {
    setSuccess(email, 'emailerror');
    flag = 0;
}

if (phonevalue === ''){
    setError(phone,'Phone number is required','phoneerror');
    flag=1;
} else if(phonevalue.toString().length!==10 || isNaN(Number(phonevalue))){
    setError(phone,'Phone Number is not valid','phoneerror');
    flag=1;
} else{
    setSuccess(phone,'phoneerror')
    flag = 0;
}

if (passwordvalue === ''){
    setError(password,'Password is required','passworderror');
    flag = 1;
} else if (passwordvalue.length < 8) {
    setError(password,'Password must be atleast 8 characters','passworderror');
    flag = 1;
} else if(passwordvalue.length > 14) {
    setError(password,'Password length cant exceed 15 characters');
    flag = 1;
} else {
    setSuccess(password,'passworderror');
    flag = 0;
}

if (conpasswordvalue===''){
    setError(confirmpassword,'This field is required','conpassworderror');
    flag = 1;
} else if (passwordvalue !== conpasswordvalue) {
    setError(confirmpassword,'Password do not match','conpassworderror');
    flag = 1;
} else if (passwordvalue.length < 8) {
    setError(password,'Password must be atleast 8 characters','passworderror');
    flag = 1;
} else if(passwordvalue.length > 14) {
    setError(password,'Password length cant exceed 15 characters');
    flag = 1;
}  else {
    setSuccess(confirmpassword,'conpassworderror');
    flag = 0;
}





if (flag === 1) {
    e.preventDefault();
    return 0;
} else {
    return 0;
}
})


function setError(element, message, id) {
    // const inputControl = element.parentElement;
    document.getElementById(id).innerText = message;
    // inputControl.classList.add('error');
    // inputControl.classList.remove('success');
}

function setSuccess(element, id) {
    // const inputControl = element.parentElement;
    document.getElementById(id).innerText = '';
    // inputControl.classList.add('success');
    // inputControl.classList.remove('error');
}

function onlyLetters(str) {
    return /^[a-zA-Z]+$/.test(str);
}

function emailvalidation(email) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
}



// function myFunction() {
//     const x = document.getElementById('password');
//     const y = document.getElementById('conpassword');
//     if (x.type === 'password' && y.type ==='password'){
//         x.type = 'text';
//         y.type = 'text';
//     } else {
//         x.type = 'password';
//         y.type = 'password';
//     }
// }