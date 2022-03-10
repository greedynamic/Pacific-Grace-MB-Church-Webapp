const { links } = require("express/lib/response");

const menu = document.querySelector('#mobile_menu')
const menulinks = document.querySelector('.header_menu')

menu.addEventListener('click', function(){
  menu.classList.toggle('is-active');
  menulinks.classList.toggle('active');

});

